import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api.js";
import {
  Search, Calendar, Download, X, Users,
  Loader2, ChevronRight, RefreshCw, Filter,
  CheckCircle2, AlertCircle, BookOpen, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    bg:          isDark ? "#0A0A0F"              : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.96)"   : "rgba(255,255,255,.96)",
    bgInput:     isDark ? "rgba(255,255,255,.04)": "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.18)": "rgba(201,169,110,.3)",
    text:        isDark ? "#F5F0E8"              : "#1A1008",
    textSec:     isDark ? "#9A9588"              : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"              : "#9A9080",
    glow1:       isDark ? "rgba(201,169,110,.05)": "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)": "rgba(201,169,110,.06)",
    placeholder: isDark ? "rgba(154,149,136,.35)": "rgba(107,94,74,.35)",
  };
}

const COLUNAS = [
  { campo: "escolaBiblica", label: "EBD",       justField: "justEscolaBiblica" },
  { campo: "quartaNoite",   label: "4ª Noite",  justField: "justQuartaNoite"   },
  { campo: "quintaNoite",   label: "5ª Noite",  justField: "justQuintaNoite"   },
  { campo: "domingoManha",  label: "Dom. Manhã",justField: "justDomingoManha"  },
  { campo: "domingoNoite",  label: "Dom. Noite",justField: "justDomingoNoite"  },
];

const JUST_CONFIG = {
  Trabalho: { emoji:"💼", color:"#6366F1", bg:"rgba(99,102,241,.1)",  border:"rgba(99,102,241,.28)" },
  Doença:   { emoji:"🤒", color:"#DC2626", bg:"rgba(220,38,38,.1)",   border:"rgba(220,38,38,.28)"  },
  Viagem:   { emoji:"✈️", color:"#0891B2", bg:"rgba(8,145,178,.1)",   border:"rgba(8,145,178,.28)"  },
  Outro:    { emoji:"📝", color:AURA.yellowDark, bg:"rgba(217,119,6,.1)", border:"rgba(217,119,6,.28)" },
};

function IEQCross({ size = 36 }) {
  return (
      <img src="/quadrangular.png" alt="IEQ"
           style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", display:"block" }} />
  );
}

/* ─── Célula de presença ───────────────────────────────────────────────── */
function CelulaPresenca({ membro, coluna, isDark, t }) {
  const marcado  = membro[coluna.campo];
  const justval  = membro[coluna.justField];
  const cfg      = JUST_CONFIG[justval] || { emoji:"📝", color:AURA.gold, bg:`${AURA.gold}15`, border:`${AURA.gold}30` };

  return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"6px 2px" }}>
        {marcado
            ? <CheckCircle2 size={18} style={{ color:"#16a34a" }} />
            : <X size={15} style={{ color:isDark?"rgba(255,255,255,.15)":"rgba(26,16,8,.15)" }} />
        }
        {!marcado && justval && (
            <div style={{
              fontSize:8, color:cfg.color, fontFamily:"'Inter',sans-serif", fontWeight:600,
              textAlign:"center", lineHeight:1.2, padding:"2px 5px",
              background:cfg.bg, borderRadius:6, border:`1px solid ${cfg.border}`,
              maxWidth:60, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
            }}>
              {cfg.emoji} {justval}
            </div>
        )}
      </div>
  );
}

/* ─── Modal de detalhe da célula ───────────────────────────────────────── */
function ModalRelatorio({ rel, isDark, t, onClose, onPDF }) {
  if (!rel) return null;
  const presencas = rel.presencas || [];

  return (
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{
                    position:"fixed", inset:0, zIndex:9999,
                    background:"rgba(10,10,15,.88)", backdropFilter:"blur(16px)",
                    display:"flex", alignItems:"flex-start", justifyContent:"center",
                    padding:"env(safe-area-inset-top,12px) 10px 10px",
                    overflowY:"auto", WebkitOverflowScrolling:"touch",
                  }}
                  onClick={onClose}>

        <motion.div
            initial={{ y:-36, opacity:0, scale:.97 }}
            animate={{ y:0,   opacity:1, scale:1   }}
            exit={{    y:-36, opacity:0, scale:.97 }}
            transition={{ type:"spring", stiffness:320, damping:30 }}
            onClick={e => e.stopPropagation()}
            style={{
              width:"100%", maxWidth:860,
              background:t.bgEl, border:`1px solid ${t.border}`,
              borderRadius:22, overflow:"hidden",
              boxShadow:"0 32px 80px rgba(0,0,0,.55)",
            }}>

          {/* Header */}
          <div style={{
            padding:"18px 20px",
            background:`linear-gradient(135deg,${AURA.blueDark},${AURA.blue})`,
            display:"flex", justifyContent:"space-between", alignItems:"center", gap:12,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
              <div style={{ width:42, height:42, borderRadius:11, background:"rgba(255,255,255,.15)",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <BookOpen size={20} style={{ color:"#fff" }} />
              </div>
              <div style={{ minWidth:0 }}>
                <h3 style={{ fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight:700,
                  color:"#fff", margin:"0 0 3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {rel.nomeCelula}
                </h3>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:"rgba(255,255,255,.65)", margin:0 }}>
                  {rel.nomeLider} · {formatarSemana(rel.dataInicio, rel.dataFim)}
                </p>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={() => onPDF(rel)}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px",
                        background:"rgba(201,169,110,.2)", border:`1px solid ${AURA.gold}50`,
                        borderRadius:10, cursor:"pointer", color:AURA.gold,
                        fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:700, letterSpacing:".12em",
                        textTransform:"uppercase", whiteSpace:"nowrap" }}>
                <Download size={13} /> PDF
              </button>
              <button onClick={onClose}
                      style={{ background:"rgba(255,255,255,.15)", border:"none",
                        color:"#fff", padding:10, borderRadius:10, cursor:"pointer", display:"flex" }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* KPIs rápidos */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
            borderBottom:`1px solid ${t.border}` }}>
            {[
              { label:"MEMBROS", value:presencas.length, color:t.text },
              { label:"PRESENTES", value:presencas.filter(p=>COLUNAS.some(c=>p[c.campo])).length, color:"#16a34a" },
              { label:"SEMANA", value:formatarSemana(rel.dataInicio, rel.dataFim), color:AURA.gold, small:true },
            ].map((k,i) => (
                <div key={i} style={{ padding:"14px 12px", textAlign:"center",
                  borderRight:i<2?`1px solid ${t.border}`:"none" }}>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:k.small?10:20,
                    fontWeight:700, color:k.color, margin:0, letterSpacing:k.small?".04em":0 }}>{k.value}</p>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:8, letterSpacing:".12em",
                    color:t.textMuted, margin:"3px 0 0" }}>{k.label}</p>
                </div>
            ))}
          </div>

          {/* Tabela — scroll horizontal no mobile */}
          <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:460 }}>
              <thead>
              <tr style={{ background:isDark?"rgba(255,255,255,.03)":"rgba(201,169,110,.05)" }}>
                <th style={{ padding:"12px 16px", textAlign:"left", fontFamily:"'Inter',sans-serif",
                  fontSize:9, fontWeight:700, letterSpacing:".14em", color:t.textMuted,
                  borderBottom:`1px solid ${t.border}`, whiteSpace:"nowrap" }}>MEMBRO</th>
                {COLUNAS.map(c => (
                    <th key={c.campo} style={{ padding:"12px 8px", textAlign:"center",
                      fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:700,
                      letterSpacing:".1em", color:t.textMuted,
                      borderBottom:`1px solid ${t.border}`, whiteSpace:"nowrap" }}>{c.label}</th>
                ))}
              </tr>
              </thead>
              <tbody>
              {presencas.map((p, i) => {
                const totalP = COLUNAS.filter(c => p[c.campo]).length;
                const pct    = Math.round((totalP / COLUNAS.length) * 100);
                return (
                    <tr key={i} style={{ borderBottom:`1px solid ${t.border}` }}
                        onMouseEnter={e => e.currentTarget.style.background=isDark?"rgba(201,169,110,.04)":"rgba(201,169,110,.05)"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"8px 16px", fontFamily:"'Inter',sans-serif",
                        fontSize:14, fontWeight:400, color:t.text, whiteSpace:"nowrap" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:8, flexShrink:0,
                            background:`linear-gradient(135deg,${AURA.blue}30,${AURA.gold}20)`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, color:AURA.gold }}>
                            {p.nomeMembro?.charAt(0) || "?"}
                          </div>
                          <div>
                            <div style={{ fontWeight:500 }}>{p.nomeMembro}</div>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
                              <div style={{ height:3, width:50, borderRadius:99,
                                background:isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)", overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${pct}%`, borderRadius:99,
                                  background:pct===100?"#16a34a":pct>=60?AURA.gold:AURA.red }} />
                              </div>
                              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9,
                                color:t.textMuted }}>{pct}%</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      {COLUNAS.map(col => (
                          <td key={col.campo} style={{ textAlign:"center", padding:"4px 6px" }}>
                            <CelulaPresenca membro={p} coluna={col} isDark={isDark} t={t} />
                          </td>
                      ))}
                    </tr>
                );
              })}
              {presencas.length === 0 && (
                  <tr>
                    <td colSpan={COLUNAS.length + 1} style={{ padding:"32px", textAlign:"center",
                      fontFamily:"'Inter',sans-serif", fontSize:13, fontStyle:"italic", color:t.textMuted }}>
                      Nenhuma presença registrada.
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>

          {/* Botão fechar rodapé */}
          <div style={{ padding:"16px 20px", borderTop:`1px solid ${t.border}` }}>
            <button onClick={onClose}
                    style={{ width:"100%", padding:"12px", borderRadius:100,
                      border:`1px solid ${t.border}`, cursor:"pointer", background:"transparent",
                      color:t.textSec, fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600,
                      letterSpacing:".14em", textTransform:"uppercase", transition:"all .3s",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <X size={14} /> Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function formatarSemana(inicio, fim) {
  if (!inicio || !fim) return "Período indefinido";
  const f = d => { const [,m,dia] = d.split("-"); return `${dia}/${m}`; };
  return `${f(inicio)} → ${f(fim)}`;
}

function obterSemanaAtual() {
  const hoje = new Date();
  const dom  = new Date(hoje); dom.setDate(hoje.getDate() - hoje.getDay());
  const sab  = new Date(dom);  sab.setDate(dom.getDate() + 6);
  return { inicio: dom.toISOString().split("T")[0], fim: sab.toISOString().split("T")[0] };
}

/* ─── Componente principal ─────────────────────────────────────────────── */
export default function Discipulado({ isDark = false }) {
  const [relatorios, setRelatorios] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [erro,       setErro]       = useState(null);
  const [busca,      setBusca]      = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim,    setDataFim]    = useState("");
  const [selected,   setSelected]   = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const t = theme(isDark);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
    @keyframes aura-spin  { to { transform: rotate(360deg); } }
    @keyframes aura-pulse { 0%,100%{opacity:.2;} 50%{opacity:.05;} }

    .disc-root {
      min-height: 100vh;
      background: ${t.bg};
      color: ${t.text};
      position: relative;
      padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
      font-family: 'Inter', sans-serif;
    }
    .disc-glow {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background:
        radial-gradient(ellipse at 15% 0%, ${t.glow1} 0%, transparent 50%),
        radial-gradient(ellipse at 85% 100%, ${t.glow2} 0%, transparent 50%);
    }
    .disc-content {
      position: relative; z-index: 1;
      max-width: 1100px; margin: 0 auto;
      padding: 24px 16px 0;
    }
    .disc-input {
      width: 100%; box-sizing: border-box;
      background: ${t.bgInput}; border: 1px solid ${t.borderInput};
      color: ${t.text}; padding: 12px 14px 12px 42px;
      border-radius: 12px; outline: none;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
      transition: all .25s; -webkit-appearance: none;
    }
    .disc-input:focus {
      border-color: ${AURA.gold}80;
      box-shadow: 0 0 0 3px ${AURA.gold}15;
    }
    .disc-input::placeholder { color: ${t.placeholder}; }
    .disc-date {
      flex: 1; min-width: 130px; box-sizing: border-box;
      background: ${t.bgInput}; border: 1px solid ${t.borderInput};
      color: ${t.text}; padding: 11px 12px;
      border-radius: 12px; outline: none;
      font-family: 'Inter', sans-serif; font-size: 13px;
      transition: all .25s; -webkit-appearance: none;
    }
    .disc-date:focus { border-color: ${AURA.gold}80; }

    /* Cards grid */
    .disc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 14px;
    }
    @media (max-width: 520px) {
      .disc-grid { grid-template-columns: 1fr; }
      .disc-content { padding: 18px 14px 0; }
    }

    /* Card hover */
    .disc-card {
      background: ${t.bgEl};
      border: 1px solid ${t.border};
      border-radius: 18px; overflow: hidden; cursor: pointer;
      transition: all .3s; position: relative;
      -webkit-tap-highlight-color: transparent;
    }
    .disc-card:hover {
      transform: translateY(-4px);
      border-color: ${AURA.gold}60;
      box-shadow: 0 14px 36px rgba(0,0,0,${isDark?.4:.12});
    }
    .disc-card:active { transform: scale(.98); }

    /* Btn */
    .disc-btn-ghost {
      display: flex; align-items: center; gap: 7px;
      padding: 0 16px; height: 38px; border-radius: 100px;
      border: 1px solid ${t.border}; cursor: pointer;
      background: transparent; color: ${t.textSec};
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase; transition: all .3s;
      white-space: nowrap;
    }
    .disc-btn-ghost:hover { border-color: ${AURA.gold}; color: ${AURA.gold}; }
    .disc-btn-gold {
      display: flex; align-items: center; gap: 7px;
      padding: 0 18px; height: 38px; border-radius: 100px; border: none;
      cursor: pointer;
      background: linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue});
      color: #fff; font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600; letter-spacing: .12em;
      text-transform: uppercase; transition: all .3s;
      box-shadow: 0 6px 20px ${AURA.blue}40; white-space: nowrap;
    }
    .disc-btn-gold:hover { opacity: .9; transform: translateY(-1px); }
    .disc-btn-gold:disabled { opacity: .45; cursor: not-allowed; }

    /* Divider dourado */
    .disc-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${AURA.gold}50, transparent);
      margin: 20px 0;
    }

    /* Safe area scroll */
    .disc-scroll { -webkit-overflow-scrolling: touch; }
  `;

  const carregarRelatorios = async () => {
    try {
      setLoading(true); setErro(null);
      const res = await api.get("/relatorios/todos-relatorios");
      setRelatorios(res.data || []);
    } catch (e) {
      setErro({ status: e.response?.status, msg: JSON.stringify(e.response?.data) });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const sem = obterSemanaAtual();
    setDataInicio(sem.inicio); setDataFim(sem.fim);
    carregarRelatorios();
  }, []);

  const filtrados = useMemo(() => relatorios.filter(rel => {
    const b  = busca.toLowerCase();
    const ok = !b || rel.nomeLider?.toLowerCase().includes(b) || rel.nomeCelula?.toLowerCase().includes(b);
    let p    = true;
    if (dataInicio) p = p && rel.dataFim   >= dataInicio;
    if (dataFim)    p = p && rel.dataInicio <= dataFim;
    return ok && p;
  }), [relatorios, busca, dataInicio, dataFim]);

  /* ── PDF individual ── */
  const gerarPDF = (rel) => {
    const doc = new jsPDF();
    doc.setFillColor(0,36,112); doc.rect(0,0,210,36,"F");
    doc.setFontSize(15); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold");
    doc.text("IEQ PITUAÇU — DISCIPULADO",14,14);
    doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text(`Célula: ${rel.nomeCelula}  |  Líder: ${rel.nomeLider}`,14,22);
    doc.text(`Período: ${formatarSemana(rel.dataInicio, rel.dataFim)}`,14,29);
    doc.setTextColor(0);
    autoTable(doc, {
      startY:42,
      head:[["Membro",...COLUNAS.map(c=>c.label),"Total"]],
      body:(rel.presencas||[]).map(p => {
        const row = [p.nomeMembro];
        COLUNAS.forEach(col => {
          const m = !!p[col.campo]; const j = p[col.justField]?.trim();
          row.push(m?"P": j?`F(${j})`:"F");
        });
        row.push(`${COLUNAS.filter(c=>!!p[c.campo]).length}/${COLUNAS.length}`);
        return row;
      }),
      headStyles:{ fillColor:[0,36,112], textColor:255, fontSize:8 },
      bodyStyles:{ fontSize:8 }, theme:"grid",
      didParseCell(d){
        if(d.section==="body"&&d.column.index>0&&d.column.index<6){
          const v=d.cell.raw;
          if(v==="P"){ d.cell.styles.textColor=[22,163,74]; d.cell.styles.fontStyle="bold"; }
          else if(typeof v==="string"&&v.startsWith("F(")){ d.cell.styles.textColor=[234,179,8]; }
          else if(v==="F"){ d.cell.styles.textColor=[200,16,46]; }
        }
      },
    });
    doc.save(`Discipulado_${rel.nomeCelula}_${rel.dataInicio}.pdf`);
  };

  /* ── PDF geral ── */
  const gerarPDFGeral = () => {
    if (!filtrados.length) return;
    const doc = new jsPDF("l","mm","a4");
    doc.setFillColor(0,36,112); doc.rect(0,0,297,40,"F");
    doc.setFontSize(18); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold");
    doc.text("IEQ PITUAÇU — DISCIPULADO GERAL",14,16);
    doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text(`Período: ${formatarSemana(dataInicio,dataFim)}  |  Células: ${filtrados.length}`,14,26);
    let y=50;
    filtrados.forEach((rel,idx) => {
      if(y>170){ doc.addPage(); y=20; }
      doc.setFillColor(9,11,31); doc.roundedRect(14,y-4,269,10,2,2,"F");
      doc.setFontSize(10); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold");
      doc.text(`${idx+1}. ${rel.nomeCelula}  |  ${rel.nomeLider}`,17,y+3);
      autoTable(doc,{
        startY:y+8,
        head:[["Membro",...COLUNAS.map(c=>c.label.substring(0,6)),"Total"]],
        body:(rel.presencas||[]).map(p=>{
          const row=[p.nomeMembro];
          COLUNAS.forEach(col=>{ const m=!!p[col.campo]; const j=p[col.justField]?.trim(); row.push(m?"P":j?`F(${j})`:"F"); });
          row.push(`${COLUNAS.filter(c=>!!p[c.campo]).length}/${COLUNAS.length}`);
          return row;
        }),
        headStyles:{fillColor:[9,11,31],textColor:255,fontSize:7},
        bodyStyles:{fontSize:7}, theme:"grid",
        didParseCell(d){
          if(d.section==="body"&&d.column.index>0&&d.column.index<6){
            const v=d.cell.raw;
            if(v==="P"){d.cell.styles.textColor=[22,163,74];d.cell.styles.fontStyle="bold";}
            else if(typeof v==="string"&&v.startsWith("F(")){d.cell.styles.textColor=[234,179,8];}
            else if(v==="F"){d.cell.styles.textColor=[200,16,46];}
          }
        },
      });
      y=doc.lastAutoTable.finalY+14;
    });
    doc.save("Discipulado_Geral.pdf");
  };

  /* ── Loading ── */
  if (loading) return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", background:t.bg }}>
        <style>{css}</style>
        <div style={{ position:"relative", display:"inline-flex", marginBottom:20 }}>
          <div style={{ position:"absolute", width:80, height:80, top:"50%", left:"50%",
            transform:"translate(-50%,-50%)", border:"1px solid rgba(201,169,110,.25)",
            borderRadius:"50%", animation:"aura-pulse 3s ease-in-out infinite" }} />
          <div style={{ width:52, height:52, borderRadius:"50%",
            background:isDark?"rgba(18,18,26,.99)":"#fff", border:"1.5px solid rgba(201,169,110,.28)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IEQCross size={36} />
          </div>
        </div>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600,
          letterSpacing:".25em", textTransform:"uppercase", color:AURA.gold, opacity:.7 }}>
          Carregando discipulado…
        </p>
      </div>
  );

  return (
      <div className="disc-root disc-scroll">
        <style>{css}</style>
        <div className="disc-glow" />

        <div className="disc-content">

          {/* ── Header ── */}
          <motion.div initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }}
                      style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                        flexWrap:"wrap", gap:14, marginBottom:22 }}>

            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:12,
                background:`${AURA.blue}18`, border:`1px solid ${AURA.blue}30`,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <BookOpen size={22} style={{ color:AURA.blue }} />
              </div>
              <div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".2em",
                  fontWeight:500, color:`${AURA.gold}88`, margin:"0 0 3px",
                  textTransform:"uppercase" }}>Controle & Auditoria</p>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(18px,4vw,24px)",
                  fontWeight:500, letterSpacing:".02em", margin:0, color:t.text }}>
                  Discipulado
                </h2>
              </div>
            </div>

            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button className="disc-btn-ghost" onClick={() => setShowFilter(!showFilter)}>
                <Filter size={14} /> {showFilter ? "Ocultar" : "Filtrar"}
              </button>
              <button className="disc-btn-ghost" onClick={carregarRelatorios}>
                <RefreshCw size={14} /> Atualizar
              </button>
              <button className="disc-btn-gold" onClick={gerarPDFGeral} disabled={!filtrados.length}>
                <Download size={14} /> Exportar PDF
              </button>
            </div>
          </motion.div>

          <div className="disc-divider" />

          {/* ── Erro ── */}
          {erro && (
              <div style={{ padding:"16px 18px", borderRadius:14, marginBottom:20,
                background:`${AURA.red}12`, border:`1px solid ${AURA.red}30`,
                display:"flex", alignItems:"center", gap:10 }}>
                <AlertCircle size={16} style={{ color:AURA.red, flexShrink:0 }} />
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:AURA.red, margin:0 }}>
                  Erro ao carregar — Status {erro.status}
                </p>
              </div>
          )}

          {/* ── Filtros ── */}
          <AnimatePresence>
            {showFilter && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                            exit={{ height:0, opacity:0 }} style={{ overflow:"hidden", marginBottom:20 }}>
                  <div style={{ background:t.bgEl, border:`1px solid ${t.border}`,
                    borderRadius:16, padding:"16px 18px",
                    display:"flex", flexDirection:"column", gap:12, backdropFilter:"blur(20px)" }}>

                    {/* Busca */}
                    <div style={{ position:"relative" }}>
                      <Search size={15} style={{ position:"absolute", left:14, top:"50%",
                        transform:"translateY(-50%)", color:AURA.gold, opacity:.5, pointerEvents:"none" }} />
                      <input className="disc-input" placeholder="Buscar por líder ou célula…"
                             value={busca} onChange={e => setBusca(e.target.value)} />
                    </div>

                    {/* Datas */}
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9,
                    letterSpacing:".14em", color:t.textMuted, whiteSpace:"nowrap" }}>DE</span>
                      <input className="disc-date" type="date"
                             value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9,
                        letterSpacing:".14em", color:t.textMuted, whiteSpace:"nowrap" }}>ATÉ</span>
                      <input className="disc-date" type="date"
                             value={dataFim} onChange={e => setDataFim(e.target.value)} />
                      <button className="disc-btn-ghost"
                              onClick={() => { const s=obterSemanaAtual(); setDataInicio(s.inicio); setDataFim(s.fim); setBusca(""); }}>
                        Esta semana
                      </button>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* ── Contador ── */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px",
              background:`${AURA.blue}15`, border:`1px solid ${AURA.blue}35`, borderRadius:10 }}>
              <BookOpen size={13} style={{ color:AURA.blue }} />
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, letterSpacing:".14em",
                color:AURA.blue, fontWeight:700 }}>
              RELATÓRIOS — {filtrados.length}
            </span>
            </div>
            <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${AURA.blue}40,transparent)` }} />
          </div>

          {/* ── Cards ── */}
          <div className="disc-grid">
            {filtrados.map((rel, i) => (
                <motion.div key={rel.id} className="disc-card"
                            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                            transition={{ delay:i*.04 }}
                            onClick={() => setSelected(rel)}>

                  {/* Topo colorido */}
                  <div style={{ height:3, background:`linear-gradient(90deg,${AURA.blue},${AURA.gold})` }} />

                  <div style={{ padding:"18px 18px 0" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"flex-start", marginBottom:12 }}>
                  <span style={{ background:`${AURA.blue}18`, color:AURA.blue,
                    border:`1px solid ${AURA.blue}35`, borderRadius:99,
                    padding:"3px 10px", fontFamily:"'Inter',sans-serif",
                    fontSize:8, fontWeight:700, letterSpacing:".1em" }}>
                    {rel.nomeCelula}
                  </span>
                      <ChevronRight size={15} style={{ color:t.textMuted }} />
                    </div>

                    <h3 style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:700,
                      color:t.text, margin:"0 0 8px",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {rel.nomeLider}
                    </h3>

                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
                      <Calendar size={12} style={{ color:AURA.gold }} />
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12,
                        fontWeight:300, color:t.textSec }}>
                    {formatarSemana(rel.dataInicio, rel.dataFim)}
                  </span>
                    </div>
                  </div>

                  {/* Stats footer */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                    borderTop:`1px solid ${t.border}` }}>
                    <div style={{ padding:"12px 14px", textAlign:"center",
                      borderRight:`1px solid ${t.border}` }}>
                      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:20,
                        fontWeight:700, color:t.text, margin:0 }}>
                        {rel.presencas?.length || 0}
                      </p>
                      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:8,
                        letterSpacing:".1em", color:t.textMuted, margin:"3px 0 0" }}>MEMBROS</p>
                    </div>
                    <div style={{ padding:"12px 14px", display:"flex",
                      alignItems:"center", justifyContent:"center", gap:6 }}>
                      <Users size={13} style={{ color:AURA.gold }} />
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9,
                        letterSpacing:".1em", color:AURA.gold, fontWeight:600 }}>VER DETALHES</span>
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>

          {/* ── Vazio ── */}
          {!erro && filtrados.length === 0 && (
              <div style={{ textAlign:"center", padding:"56px 24px", background:t.bgEl,
                borderRadius:20, border:`2px dashed ${t.border}`, marginTop:16 }}>
                <AlertCircle size={36} style={{ color:`${AURA.gold}40`, margin:"0 auto 14px" }} />
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300,
                  color:t.textMuted, margin:0 }}>Nenhum relatório encontrado.</p>
              </div>
          )}

          <div className="disc-divider" style={{ marginTop:28 }} />
          <p style={{ textAlign:"center", fontFamily:"'Inter',sans-serif", fontSize:9,
            letterSpacing:".18em", textTransform:"uppercase", paddingBottom:16,
            color:isDark?"rgba(245,240,232,.1)":"rgba(26,16,8,.12)" }}>
            © {new Date().getFullYear()} IEQ Pituaçu — Sistema Eclesiástico
          </p>
        </div>

        {/* ── Modal ── */}
        <AnimatePresence>
          {selected && (
              <ModalRelatorio rel={selected} isDark={isDark} t={t}
                              onClose={() => setSelected(null)} onPDF={gerarPDF} />
          )}
        </AnimatePresence>
      </div>
  );
}
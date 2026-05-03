import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../../services/api.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileText, Download, Calendar, Search, Phone, ShieldAlert, ChevronRight, Loader2, User
} from "lucide-react";

/* ─── Design Tokens IEQ ─── */
const IEQ = {
  red:"#C8102E", redDark:"#8B0B1F", yellow:"#FDB813",
  blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
  offWhite:"#F5F0E8", dark:"#0A0608",
};
const orange = "#D97706";

export default function FichasEncontro({ isDark = false }) {
  const [fichas,     setFichas]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
  const inputBg     = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";

  const styles = `
    @keyframes spin{to{transform:rotate(360deg)}} .spin-icon{animation:spin 1s linear infinite;}
    .ieq-field{width:100%;background:${inputBg};border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      color:${textPrimary};padding:10px 14px;border-radius:8px;outline:none;
      font-family:'EB Garamond',serif;font-size:14px;transition:all .25s;}
    .ieq-field:focus{border-color:${IEQ.red};box-shadow:0 0 0 3px rgba(200,16,46,.12);}
    .ieq-label{font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:.2em;color:${textSec};text-transform:uppercase;display:block;margin-bottom:6px;}
    .ieq-ficha-card{background:${cardBg};border:1px solid ${border};border-radius:12px;padding:18px;transition:all .3s;backdrop-filter:blur(24px);}
    .ieq-ficha-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(217,119,6,.1);border-color:${orange};}
    .ieq-grid-f{display:grid;grid-template-columns:1fr;gap:12px;}
    @media(min-width:560px){.ieq-grid-f{grid-template-columns:repeat(2,1fr);}}
    @media(min-width:900px){.ieq-grid-f{grid-template-columns:repeat(3,1fr);}}
    .ieq-filter-grid{display:grid;grid-template-columns:1fr;gap:12px;}
    @media(min-width:520px){.ieq-filter-grid{grid-template-columns:1fr 1fr auto;}}
  `;

  const carregarFichas = useCallback(async () => {
    try {
      setLoading(true);
      if (dataInicio && dataFim && dataFim < dataInicio) {
        alert("A data fim não pode ser menor que a data início");
        return;
      }
      const res = await api.get("/relatorios/encontro/periodo", { params:{ inicio:dataInicio, fim:dataFim } });
      setFichas(res.data || []);
    } catch (err) { console.error("Erro ao carregar fichas", err); setFichas([]); }
    finally { setLoading(false); }
  }, [dataInicio, dataFim]);

  useEffect(() => { carregarFichas(); }, [carregarFichas]);

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return "?";
    const hoje = new Date(), nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  const gerarPDFCompleto = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFillColor(139, 11, 31);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("RELATÓRIO DE ENCONTRISTAS", 14, 18);
    doc.setFontSize(10);
    doc.text(`Período: ${dataInicio} a ${dataFim}`, 14, 25);
    autoTable(doc, {
      startY: 35,
      head: [["Nome", "Idade", "Telefone", "Líder Responsável"]],
      body: fichas.map(f => [
        f.nomeConvidado || f.nome || "",
        calcularIdade(f.dataNascimento) + " anos",
        f.telefone || "Não informado",
        f.liderResponsavel || f.nomeLiderCelula || "Pendente",
      ]),
      headStyles: { fillColor:[139,11,31], textColor:255, fontStyle:"bold" },
      alternateRowStyles: { fillColor:[245,240,232] },
    });
    doc.save(`Relatorio_Encontristas.pdf`);
  };

  return (
      <div style={{ padding:"24px 20px", fontFamily:"'EB Garamond',serif", color:textPrimary }}>
        <style>{styles}</style>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:10, background:`${orange}22`, display:"flex", alignItems:"center", justifyContent:"center", color:orange }}>
              <FileText size={20}/>
            </div>
            <div>
              <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>FICHAS DE ENCONTRO</h3>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSec, margin:0 }}>GESTÃO DE ENCONTRISTAS</p>
            </div>
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={gerarPDFCompleto} disabled={fichas.length===0}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", borderRadius:8,
                      border:`1px solid ${border}`, cursor:fichas.length===0?"not-allowed":"pointer",
                      background:isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)", color:textPrimary,
                      fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".14em",
                      opacity:fichas.length===0?.5:1, transition:"all .2s" }}>
              <Download size={14}/> RELATÓRIO PDF
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:10, padding:16, marginBottom:22, backdropFilter:"blur(24px)" }}>
          <div className="ieq-filter-grid">
            <div>
              <label className="ieq-label">DATA INÍCIO</label>
              <div style={{ position:"relative" }}>
                <Calendar size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:textSec }}/>
                <input type="date" className="ieq-field" style={{ paddingLeft:36 }}
                       value={dataInicio} onChange={e=>setDataInicio(e.target.value)}/>
              </div>
            </div>
            <div>
              <label className="ieq-label">DATA FIM</label>
              <div style={{ position:"relative" }}>
                <Calendar size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:textSec }}/>
                <input type="date" className="ieq-field" style={{ paddingLeft:36 }}
                       value={dataFim} onChange={e=>setDataFim(e.target.value)}/>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end" }}>
              <button onClick={carregarFichas}
                      style={{ padding:"10px 20px", borderRadius:8, border:"none", cursor:"pointer",
                        background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`, color:"#fff",
                        fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".14em",
                        width:"100%", transition:"all .25s" }}
                      onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
                      onMouseLeave={e=>e.currentTarget.style.filter="brightness(1)"}>
                FILTRAR
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <Loader2 size={30} className="spin-icon" style={{ color:orange, display:"inline-block" }}/>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSec, marginTop:12 }}>BUSCANDO FICHAS...</p>
            </div>
        ) : fichas.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 24px", borderRadius:12,
              border:`2px dashed ${border}`, background:isDark?"rgba(255,255,255,.02)":"rgba(200,16,46,.02)" }}>
              <ShieldAlert size={40} style={{ color:textSec, display:"block", margin:"0 auto 14px" }}/>
              <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".12em", color:textPrimary, margin:"0 0 8px" }}>
                NENHUM REGISTRO ENCONTRADO
              </h4>
              <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:textSec, margin:0 }}>
                Ajuste o período de datas e tente novamente.
              </p>
            </div>
        ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSec }}>
              {fichas.length} PARTICIPANTES ENCONTRADOS
            </span>
              </div>
              <motion.div className="ieq-grid-f" initial="hidden" animate="visible"
                          variants={{ hidden:{}, visible:{ transition:{staggerChildren:.05} } }}>
                {fichas.map(f => (
                    <motion.div key={f.id} className="ieq-ficha-card"
                                variants={{ hidden:{opacity:0,y:14}, visible:{opacity:1,y:0} }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                        <div style={{ width:44, height:44, borderRadius:10, flexShrink:0,
                          background:`${orange}22`, display:"flex", alignItems:"center", justifyContent:"center",
                          color:orange, fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:18 }}>
                          {(f.nomeConvidado||f.nome||"?")[0].toUpperCase()}
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <span className="ieq-label" style={{ marginBottom:2 }}>IDADE</span>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, color:textPrimary, margin:0 }}>
                            {calcularIdade(f.dataNascimento)} anos
                          </p>
                        </div>
                      </div>

                      <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".1em",
                        color:textPrimary, margin:"0 0 8px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {(f.nomeConvidado||f.nome||"").toUpperCase()}
                      </h4>

                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
                        <Phone size={12} style={{ color:textSec }}/>
                        <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSec }}>
                    {f.telefone || "Não informado"}
                  </span>
                      </div>

                      <div style={{ borderTop:`1px solid ${border}`, paddingTop:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div>
                          <span className="ieq-label" style={{ marginBottom:2 }}>LÍDER RESPONSÁVEL</span>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:orange, margin:0, fontStyle:"italic" }}>
                            {f.liderResponsavel || f.nomeLiderCelula || "Pendente"}
                          </p>
                        </div>
                        <ChevronRight size={15} style={{ color:textSec }}/>
                      </div>
                    </motion.div>
                ))}
              </motion.div>
            </>
        )}

        {/* Badge flutuante */}
        {fichas.length > 0 && (
            <div style={{ position:"fixed", bottom:24, right:24, zIndex:50,
              background:isDark?"rgba(17,10,13,.97)":"rgba(255,255,255,.95)",
              border:`1px solid ${border}`, borderRadius:99, padding:"10px 18px",
              display:"flex", alignItems:"center", gap:8, backdropFilter:"blur(16px)",
              boxShadow:"0 8px 24px rgba(0,0,0,.15)" }}>
              <User size={15} style={{ color:IEQ.red }}/>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".14em", color:textPrimary }}>
            {fichas.length} PARTICIPANTES
          </span>
            </div>
        )}
      </div>
  );
}
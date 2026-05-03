import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  UserPlus, Search, Phone, Calendar, ShieldCheck, Plus, X, ChevronRight, Loader2, Heart, Users
} from "lucide-react";

/* ─── Design Tokens IEQ ─── */
const IEQ = {
  red:"#C8102E", redDark:"#8B0B1F", redLight:"#E8294A",
  yellow:"#FDB813", blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
  offWhite:"#F5F0E8", dark:"#0A0608",
};
const purple = "#7C3AED";
const purpleDark = "#5B21B6";

const ORIGENS = {
  CONVITE:"Convite", REDES_SOCIAIS:"Redes Sociais",
  ESPONTANEO:"Espontâneo", OUTRO:"Outro",
};

const formInicial = {
  nome:"", email:"", telefone:"",
  dataPrimeiraVisita: new Date().toISOString().split("T")[0],
  origem:"CONVITE", responsavelAcompanhamento:"", convertido:false,
};

export default function Visitantes({ isDark = false }) {
  const [visitantes,  setVisitantes]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId,  setEditandoId]  = useState(null);
  const [filtro,      setFiltro]      = useState("");
  const [form,        setForm]        = useState(formInicial);

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
  const inputBg     = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";

  const styles = `
    @keyframes spin{to{transform:rotate(360deg)}} .spin-icon{animation:spin 1s linear infinite;}
    .ieq-field{width:100%;background:${inputBg};border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      color:${textPrimary};padding:11px 14px;border-radius:8px;outline:none;
      font-family:'EB Garamond',serif;font-size:15px;transition:all .25s;}
    .ieq-field:focus{border-color:${IEQ.red};box-shadow:0 0 0 3px rgba(200,16,46,.12);}
    .ieq-field::placeholder{color:${isDark?"rgba(245,240,232,.25)":"rgba(26,10,13,.3)"};}
    .ieq-label{font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:.2em;color:${textSec};text-transform:uppercase;display:block;margin-bottom:6px;}
    .ieq-visit-card{background:${cardBg};border:1px solid ${border};border-radius:12px;padding:18px;cursor:pointer;transition:all .3s;backdrop-filter:blur(24px);position:relative;overflow:hidden;}
    .ieq-visit-card:hover{transform:translateY(-4px);box-shadow:0 14px 36px rgba(124,58,237,.12);border-color:${purple};}
    .ieq-grid-v{display:grid;grid-template-columns:1fr;gap:12px;}
    @media(min-width:560px){.ieq-grid-v{grid-template-columns:repeat(2,1fr);}}
    @media(min-width:900px){.ieq-grid-v{grid-template-columns:repeat(3,1fr);}}
    .ieq-form-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    @media(max-width:400px){.ieq-form-grid2{grid-template-columns:1fr;}}
    .ieq-modal-backdrop{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;}
    @media(min-width:520px){.ieq-modal-backdrop{align-items:center;padding:12px;}}
    .ieq-modal-box{position:relative;z-index:10;width:100%;max-height:90vh;display:flex;flex-direction:column;border-radius:16px 16px 0 0;overflow:hidden;}
    @media(min-width:520px){.ieq-modal-box{border-radius:14px;max-height:calc(100vh - 24px);max-width:520px;}}
  `;

  const listar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/visitantes");
      setVisitantes(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Erro ao listar visitantes:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { listar(); }, [listar]);

  const abrirModalNovo   = () => { setEditandoId(null); setForm(formInicial); setIsModalOpen(true); };
  const abrirModalEdicao = (v) => {
    setEditandoId(v.id);
    setForm({ nome:v.nome||"", email:v.email||"", telefone:v.telefone||"",
      dataPrimeiraVisita: v.dataPrimeiraVisita ? v.dataPrimeiraVisita.split("T")[0] : "",
      origem:v.origem||"CONVITE", responsavelAcompanhamento:v.responsavelAcompanhamento||"",
      convertido:!!v.convertido });
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) await api.put(`/visitantes/${editandoId}`, form);
      else            await api.post("/visitantes", form);
      fecharModal(); listar();
    } catch { alert("Erro ao salvar visitante."); }
  };

  const fecharModal = () => { setIsModalOpen(false); setForm(formInicial); setEditandoId(null); };
  const f = v => setForm(p => ({...p,...v}));

  const visitantesFiltrados = visitantes.filter(v =>
      v.nome?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
      <div style={{ padding:"24px 20px", fontFamily:"'EB Garamond',serif", color:textPrimary }}>
        <style>{styles}</style>

        {/* Header */}
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:10, background:`${purple}22`, display:"flex", alignItems:"center", justifyContent:"center", color:purple }}>
                <UserPlus size={20}/>
              </div>
              <div>
                <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>VISITANTES</h3>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSec, margin:0 }}>{visitantes.length} PESSOAS ALCANÇADAS</p>
              </div>
            </div>
            <button onClick={abrirModalNovo}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:8, border:"none", cursor:"pointer",
                      background:`linear-gradient(135deg,${purpleDark},${purple})`, color:"#fff",
                      fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".16em" }}>
              <Plus size={15}/> NOVO CADASTRO
            </button>
          </div>

          <div style={{ position:"relative" }}>
            <Search size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.6 }}/>
            <input className="ieq-field" style={{ paddingLeft:42 }}
                   placeholder="Buscar visitante..."
                   value={filtro} onChange={e=>setFiltro(e.target.value)} />
          </div>
        </div>

        {/* Lista */}
        {loading ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <Loader2 size={30} className="spin-icon" style={{ color:purple, display:"inline-block" }}/>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSec, marginTop:12 }}>CARREGANDO...</p>
            </div>
        ) : (
            <motion.div className="ieq-grid-v" initial="hidden" animate="visible"
                        variants={{ hidden:{}, visible:{ transition:{staggerChildren:.06} } }}>
              {visitantesFiltrados.map(v => (
                  <motion.div key={v.id} className="ieq-visit-card"
                              variants={{ hidden:{opacity:0,y:14}, visible:{opacity:1,y:0} }}
                              onClick={() => abrirModalEdicao(v)}>

                    {v.convertido && (
                        <div style={{ position:"absolute", top:0, right:0, background:`linear-gradient(135deg,#059669,#065f46)`,
                          color:"#fff", padding:"4px 14px", borderRadius:"0 12px 0 12px",
                          fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".14em",
                          display:"flex", alignItems:"center", gap:4 }}>
                          <Heart size={9} fill="#fff"/> DECIDIDO
                        </div>
                    )}

                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                      <div style={{ width:46, height:46, borderRadius:10, flexShrink:0,
                        background:`linear-gradient(135deg,${purpleDark}33,${purple}22)`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        color:purple, fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:18,
                        border:`1px solid ${purple}33`, transition:"transform .3s" }}>
                        {v.nome?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth:0, flex:1 }}>
                        <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".1em",
                          color:textPrimary, margin:"0 0 5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {v.nome}
                        </h4>
                        <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:99,
                          background:isDark?"rgba(124,58,237,.15)":"rgba(124,58,237,.08)",
                          color:purple, border:`1px solid ${purple}33`,
                          fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".12em" }}>
                    {ORIGENS[v.origem] || v.origem}
                  </span>
                      </div>
                    </div>

                    <div style={{ borderTop:`1px solid ${border}`, paddingTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Phone size={13} style={{ color:textSec, flexShrink:0 }}/>
                        <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSec }}>{v.telefone || "Sem telefone"}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Calendar size={13} style={{ color:textSec, flexShrink:0 }}/>
                        <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSec }}>
                    {v.dataPrimeiraVisita ? new Date(v.dataPrimeiraVisita+"T12:00:00").toLocaleDateString("pt-BR") : "Data não registrada"}
                  </span>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                        background:isDark?"rgba(255,255,255,.03)":"rgba(124,58,237,.04)",
                        padding:"9px 12px", borderRadius:8, border:`1px solid ${purple}22`, marginTop:2 }}>
                        <div>
                          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:".14em", color:textSec, margin:"0 0 2px" }}>ACOMPANHAMENTO</p>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:purple, margin:0, fontStyle:"italic" }}>
                            {v.responsavelAcompanhamento || "A definir"}
                          </p>
                        </div>
                        <ChevronRight size={15} style={{ color:textSec }}/>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </motion.div>
        )}

        {/* MODAL */}
        <AnimatePresence>
          {isModalOpen && (
              <div className="ieq-modal-backdrop">
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                            onClick={fecharModal}
                            style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)", backdropFilter:"blur(16px)", zIndex:0 }}/>
                <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}}
                            className="ieq-modal-box"
                            style={{ background:cardBg, border:`1px solid ${border}`, backdropFilter:"blur(24px)" }}>

                  <div style={{ padding:"20px 22px 14px", borderBottom:`1px solid ${border}`, flexShrink:0,
                    display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>
                        {editandoId ? "ATUALIZAR PERFIL" : "NOVO VISITANTE"}
                      </h2>
                      <div style={{ height:2, width:36, background:`linear-gradient(90deg,${purple},${IEQ.red})`, borderRadius:99, marginTop:6 }}/>
                    </div>
                    <button onClick={fecharModal} style={{ background:"none", border:"none", cursor:"pointer", color:textSec }}>
                      <X size={20}/>
                    </button>
                  </div>

                  <form onSubmit={salvar} style={{ overflowY:"auto", flex:1, padding:"20px 22px 24px", display:"flex", flexDirection:"column", gap:14 }}>

                    <div>
                      <label className="ieq-label">NOME DO VISITANTE *</label>
                      <input required className="ieq-field" placeholder="Nome completo"
                             value={form.nome} onChange={e=>f({nome:e.target.value})}/>
                    </div>

                    <div className="ieq-form-grid2">
                      <div>
                        <label className="ieq-label">WHATSAPP</label>
                        <input className="ieq-field" placeholder="(00) 00000-0000"
                               value={form.telefone} onChange={e=>f({telefone:e.target.value})}/>
                      </div>
                      <div>
                        <label className="ieq-label">E-MAIL</label>
                        <input type="email" className="ieq-field" placeholder="Opcional"
                               value={form.email} onChange={e=>f({email:e.target.value})}/>
                      </div>
                    </div>

                    <div className="ieq-form-grid2">
                      <div>
                        <label className="ieq-label">DATA DA VISITA</label>
                        <input type="date" className="ieq-field"
                               value={form.dataPrimeiraVisita} onChange={e=>f({dataPrimeiraVisita:e.target.value})}/>
                      </div>
                      <div>
                        <label className="ieq-label">COMO CHEGOU?</label>
                        <select className="ieq-field" value={form.origem} onChange={e=>f({origem:e.target.value})}>
                          {Object.entries(ORIGENS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="ieq-label">RESPONSÁVEL PELO ACOMPANHAMENTO</label>
                      <div style={{ position:"relative" }}>
                        <Users size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:textSec }}/>
                        <input className="ieq-field" style={{ paddingLeft:40 }}
                               placeholder="Nome do líder responsável"
                               value={form.responsavelAcompanhamento} onChange={e=>f({responsavelAcompanhamento:e.target.value})}/>
                      </div>
                    </div>

                    {/* Toggle Convertido */}
                    <label style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"14px 16px", borderRadius:10, cursor:"pointer", transition:"all .3s",
                      background: form.convertido ? "rgba(5,150,105,.15)" : isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)",
                      border:`1px solid ${form.convertido ? "rgba(5,150,105,.4)" : border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <ShieldCheck size={20} style={{ color: form.convertido ? "#059669" : textSec }}/>
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".12em",
                          color: form.convertido ? "#059669" : textPrimary }}>
                      JÁ ACEITOU JESUS?
                    </span>
                      </div>
                      <input type="checkbox" style={{ display:"none" }}
                             checked={form.convertido} onChange={e=>f({convertido:e.target.checked})}/>
                      <div style={{ width:44, height:24, borderRadius:99, position:"relative", transition:"all .3s",
                        background: form.convertido ? "#059669" : isDark?"rgba(255,255,255,.15)":"rgba(0,0,0,.15)" }}>
                        <div style={{ position:"absolute", top:3, width:18, height:18, borderRadius:"50%", background:"#fff",
                          transition:"all .3s", left: form.convertido ? 23 : 3, boxShadow:"0 1px 4px rgba(0,0,0,.2)" }}/>
                      </div>
                    </label>

                    <button type="submit"
                            style={{ padding:"14px 0", borderRadius:8, border:"none", cursor:"pointer",
                              background:`linear-gradient(135deg,${purpleDark},${purple})`, color:"#fff",
                              fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".16em" }}>
                      {editandoId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR CADASTRO"}
                    </button>
                  </form>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
}
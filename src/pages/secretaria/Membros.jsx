import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Plus, X, User, Phone, Trash2, Loader2, Search, CreditCard, Heart, ChevronRight, Mail
} from "lucide-react";

/* ─── Design Tokens IEQ ─── */
const IEQ = {
  red:"#C8102E", redDark:"#8B0B1F", redLight:"#E8294A",
  yellow:"#FDB813", blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
  offWhite:"#F5F0E8", dark:"#0A0608",
};

const STATUS_COLORS = {
  ATIVO:       { bg:"rgba(5,150,105,.12)",  text:"#059669", border:"rgba(5,150,105,.3)"   },
  INATIVO:     { bg:"rgba(200,16,46,.1)",   text:IEQ.red,   border:"rgba(200,16,46,.3)"   },
  AFASTADO:    { bg:"rgba(253,184,19,.12)", text:"#C48C00", border:"rgba(253,184,19,.35)" },
  TRANSFERIDO: { bg:"rgba(0,61,165,.1)",    text:IEQ.blue,  border:"rgba(0,61,165,.3)"    },
  FALECIDO:    { bg:"rgba(100,100,100,.1)", text:"#666",    border:"rgba(100,100,100,.3)" },
};

const estadoCivilOptions = [
  {value:"SOLTEIRO",label:"Solteiro(a)"},{value:"CASADO",label:"Casado(a)"},
  {value:"DIVORCIADO",label:"Divorciado(a)"},{value:"VIUVO",label:"Viúvo(a)"},
  {value:"UNIAO_ESTAVEL",label:"União Estável"},
];
const statusOptions = ["ATIVO","INATIVO","AFASTADO","TRANSFERIDO","FALECIDO"];

const formInicial = {
  nome:"", email:"", telefone:"", endereco:"", cpf:"",
  estadoCivil:"SOLTEIRO", dataNascimento:"", dataConversao:"",
  dataBatismo:"", status:"ATIVO",
};

export default function Membros({ isDark = false }) {
  const [membros,       setMembros]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editandoId,    setEditandoId]    = useState(null);
  const [statusOriginal,setStatusOriginal]= useState(null);
  const [filtro,        setFiltro]        = useState("");
  const [form,          setForm]          = useState(formInicial);

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
  const inputBg     = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";

  const styles = `
    @keyframes spin{to{transform:rotate(360deg)}} .spin-icon{animation:spin 1s linear infinite;}
    .ieq-field {
      width:100%; background:${inputBg};
      border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      color:${textPrimary}; padding:11px 14px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
    }
    .ieq-field:focus{border-color:${IEQ.red};box-shadow:0 0 0 3px rgba(200,16,46,.12);}
    .ieq-field::placeholder{color:${isDark?"rgba(245,240,232,.25)":"rgba(26,10,13,.3)"};}
    .ieq-label{font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:.2em;color:${textSec};text-transform:uppercase;display:block;margin-bottom:6px;}
    .ieq-member-card{background:${cardBg};border:1px solid ${border};border-radius:12px;padding:18px;cursor:pointer;transition:all .3s;backdrop-filter:blur(24px);}
    .ieq-member-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(200,16,46,.12);border-color:${IEQ.red};}
    .ieq-grid-m{display:grid;grid-template-columns:1fr;gap:12px;}
    @media(min-width:560px){.ieq-grid-m{grid-template-columns:repeat(2,1fr);}}
    @media(min-width:900px){.ieq-grid-m{grid-template-columns:repeat(3,1fr);}}
    .ieq-form-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    @media(max-width:400px){.ieq-form-grid2{grid-template-columns:1fr;}}
    .ieq-modal-backdrop{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;}
    @media(min-width:520px){.ieq-modal-backdrop{align-items:center;padding:12px;}}
    .ieq-modal-box{position:relative;z-index:10;width:100%;max-height:90vh;display:flex;flex-direction:column;border-radius:16px 16px 0 0;overflow:hidden;}
    @media(min-width:520px){.ieq-modal-box{border-radius:14px;max-height:calc(100vh - 24px);max-width:560px;}}
  `;

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/membros");
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setMembros(data);
    } catch (err) { console.error("Erro ao listar membros:", err); setMembros([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { listar(); }, [listar]);

  const abrirModalNovo = () => { setEditandoId(null); setStatusOriginal(null); setForm(formInicial); setIsModalOpen(true); };
  const abrirModalEdicao = (m) => {
    setEditandoId(m.id); setStatusOriginal(m.status);
    setForm({ ...m,
      dataNascimento:m.dataNascimento?.split("T")[0]||"",
      dataConversao: m.dataConversao?.split("T")[0]||"",
      dataBatismo:   m.dataBatismo?.split("T")[0]||"",
    });
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        if (form.status !== statusOriginal) {
          if (!window.confirm("Alterar o status removerá o membro de células. Continuar?")) return;
          await api.put(`/membros/${editandoId}/status`, null, { params:{ status:form.status } });
        }
        await api.put(`/membros/${editandoId}`, form);
      } else {
        await api.post("/membros", form);
      }
      fecharModal(); listar();
    } catch { alert("Erro ao salvar dados."); }
  };

  const fecharModal = () => { setIsModalOpen(false); setEditandoId(null); };
  const excluir = async () => {
    if (!window.confirm("Excluir permanentemente?")) return;
    await api.delete(`/membros/${editandoId}`);
    fecharModal(); listar();
  };

  const membrosFiltrados = membros.filter(m =>
      m.nome?.toLowerCase().includes(filtro.toLowerCase()) || m.cpf?.includes(filtro)
  );

  const f = v => setForm(p => ({...p, ...v}));

  return (
      <div style={{ padding:"24px 20px", fontFamily:"'EB Garamond',serif", color:textPrimary }}>
        <style>{styles}</style>

        {/* Header */}
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:10, background:`${IEQ.blue}22`, display:"flex", alignItems:"center", justifyContent:"center", color:IEQ.blue }}>
                <User size={20}/>
              </div>
              <div>
                <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>MEMBRESIA</h3>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSec, margin:0 }}>{membros.length} REGISTROS</p>
              </div>
            </div>
            <button onClick={abrirModalNovo}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:8, border:"none", cursor:"pointer",
                      background:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`, color:"#fff",
                      fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".16em" }}>
              <Plus size={15}/> NOVO MEMBRO
            </button>
          </div>

          {/* Busca */}
          <div style={{ position:"relative" }}>
            <Search size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.6 }} />
            <input className="ieq-field" style={{ paddingLeft:42 }}
                   placeholder="Buscar por nome ou CPF..."
                   value={filtro} onChange={e=>setFiltro(e.target.value)} />
          </div>
        </div>

        {/* Lista */}
        {loading ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <Loader2 size={30} className="spin-icon" style={{ color:IEQ.blue, display:"inline-block" }} />
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSec, marginTop:12 }}>CARREGANDO...</p>
            </div>
        ) : (
            <motion.div className="ieq-grid-m" initial="hidden" animate="visible"
                        variants={{ hidden:{}, visible:{ transition:{staggerChildren:.05} } }}>
              {membrosFiltrados.map(m => {
                const sc = STATUS_COLORS[m.status] || STATUS_COLORS.INATIVO;
                return (
                    <motion.div key={m.id} className="ieq-member-card"
                                variants={{ hidden:{opacity:0,y:14}, visible:{opacity:1,y:0} }}
                                onClick={() => abrirModalEdicao(m)}>
                      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                        <div style={{ width:44, height:44, borderRadius:10, flexShrink:0,
                          background:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color:"#fff", fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:16 }}>
                          {m.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth:0, flex:1 }}>
                          <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".1em",
                            color:textPrimary, margin:"0 0 5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {m.nome?.toUpperCase()}
                          </h4>
                          <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 10px", borderRadius:99,
                            background:sc.bg, color:sc.text, border:`1px solid ${sc.border}`,
                            fontFamily:"'Cinzel',serif", fontSize:8, fontWeight:700, letterSpacing:".14em" }}>
                      {m.status}
                    </span>
                        </div>
                        <ChevronRight size={15} style={{ color:textSec, flexShrink:0 }} />
                      </div>
                      <div style={{ borderTop:`1px solid ${border}`, paddingTop:12, display:"flex", flexDirection:"column", gap:6 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <CreditCard size={13} style={{ color:textSec, flexShrink:0 }} />
                          <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSec, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {m.cpf || "CPF não informado"}
                    </span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <Phone size={13} style={{ color:textSec, flexShrink:0 }} />
                          <span style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:textSec }}>{m.telefone || "Sem telefone"}</span>
                        </div>
                      </div>
                    </motion.div>
                );
              })}
            </motion.div>
        )}

        {/* MODAL */}
        <AnimatePresence>
          {isModalOpen && (
              <div className="ieq-modal-backdrop">
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                            onClick={fecharModal}
                            style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)", backdropFilter:"blur(16px)", zIndex:0 }} />
                <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}}
                            className="ieq-modal-box"
                            style={{ background:cardBg, border:`1px solid ${border}`, backdropFilter:"blur(24px)" }}>

                  {/* Modal header sticky */}
                  <div style={{ padding:"20px 22px 14px", borderBottom:`1px solid ${border}`, flexShrink:0,
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    background:cardBg }}>
                    <div>
                      <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>
                        {editandoId ? "EDITAR PERFIL" : "NOVO CADASTRO"}
                      </h2>
                      <div style={{ height:2, width:36, background:`linear-gradient(90deg,${IEQ.blue},${IEQ.yellow})`, borderRadius:99, marginTop:6 }} />
                    </div>
                    <button onClick={fecharModal} style={{ background:"none", border:"none", cursor:"pointer", color:textSec }}>
                      <X size={20}/>
                    </button>
                  </div>

                  {/* Scrollable form */}
                  <form onSubmit={salvar} style={{ overflowY:"auto", flex:1, padding:"20px 22px 24px", display:"flex", flexDirection:"column", gap:14 }}>

                    <div className="ieq-form-grid2">
                      <div style={{ gridColumn:"1/-1" }}>
                        <label className="ieq-label">NOME COMPLETO *</label>
                        <input required className="ieq-field" value={form.nome} onChange={e=>f({nome:e.target.value})} />
                      </div>
                      <div>
                        <label className="ieq-label">CPF</label>
                        <input className="ieq-field" placeholder="000.000.000-00" value={form.cpf} onChange={e=>f({cpf:e.target.value})} />
                      </div>
                      <div>
                        <label className="ieq-label">WHATSAPP</label>
                        <input className="ieq-field" value={form.telefone} onChange={e=>f({telefone:e.target.value})} />
                      </div>
                      <div style={{ gridColumn:"1/-1" }}>
                        <label className="ieq-label">E-MAIL</label>
                        <input type="email" className="ieq-field" value={form.email} onChange={e=>f({email:e.target.value})} />
                      </div>
                      <div style={{ gridColumn:"1/-1" }}>
                        <label className="ieq-label">ENDEREÇO</label>
                        <input className="ieq-field" value={form.endereco} onChange={e=>f({endereco:e.target.value})} />
                      </div>
                      <div>
                        <label className="ieq-label">NASCIMENTO</label>
                        <input type="date" className="ieq-field" value={form.dataNascimento} onChange={e=>f({dataNascimento:e.target.value})} />
                      </div>
                      <div>
                        <label className="ieq-label">ESTADO CIVIL</label>
                        <select className="ieq-field" value={form.estadoCivil} onChange={e=>f({estadoCivil:e.target.value})}>
                          {estadoCivilOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn:"1/-1" }}>
                        <label className="ieq-label">STATUS</label>
                        <select className="ieq-field" value={form.status} onChange={e=>f({status:e.target.value})}>
                          {statusOptions.map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Jornada espiritual */}
                    <div style={{ padding:"16px 14px", borderRadius:10,
                      background:isDark?"rgba(0,61,165,.08)":"rgba(0,61,165,.05)",
                      border:`1px solid ${isDark?"rgba(0,61,165,.2)":"rgba(0,61,165,.12)"}` }}>
                      <p style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:IEQ.blue, margin:"0 0 12px" }}>
                        <Heart size={13}/> JORNADA ESPIRITUAL
                      </p>
                      <div className="ieq-form-grid2">
                        <div>
                          <label className="ieq-label">DATA CONVERSÃO</label>
                          <input type="date" className="ieq-field" value={form.dataConversao} onChange={e=>f({dataConversao:e.target.value})} />
                        </div>
                        <div>
                          <label className="ieq-label">DATA BATISMO</label>
                          <input type="date" className="ieq-field" value={form.dataBatismo} onChange={e=>f({dataBatismo:e.target.value})} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:4 }}>
                      <button type="submit"
                              style={{ padding:"14px 0", borderRadius:8, border:"none", cursor:"pointer",
                                background:`linear-gradient(135deg,${IEQ.blueDark},${IEQ.blue})`, color:"#fff",
                                fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".16em" }}>
                        {editandoId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR CADASTRO"}
                      </button>
                      {editandoId && (
                          <button type="button" onClick={excluir}
                                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                                    padding:"10px 0", border:"none", cursor:"pointer", background:"none",
                                    color:IEQ.red, fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".14em" }}>
                            <Trash2 size={13}/> EXCLUIR REGISTRO
                          </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
}
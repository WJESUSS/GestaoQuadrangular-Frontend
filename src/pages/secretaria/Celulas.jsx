import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Home, Plus, User, Clock, Search, X, ChevronRight, Loader2,
  Calendar, MapPin, Building2
} from "lucide-react";

/* ─── Design Tokens IEQ ─── */
const IEQ = {
  red:"#C8102E", redDark:"#8B0B1F", redLight:"#E8294A",
  yellow:"#FDB813", yellowDark:"#C48C00",
  blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
  offWhite:"#F5F0E8", dark:"#0A0608",
};
const green = "#059669";

const DIAS = {
  MONDAY:"Segunda", TUESDAY:"Terça", WEDNESDAY:"Quarta",
  THURSDAY:"Quinta", FRIDAY:"Sexta", SATURDAY:"Sábado", SUNDAY:"Domingo",
};

export default function Celulas({ isDark = false }) {
  const [celulas,            setCelulas]            = useState([]);
  const [lideresDisponiveis, setLideresDisponiveis] = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [editandoId,         setEditandoId]         = useState(null);
  const [filtro,             setFiltro]             = useState("");

  const formInicial = { nome:"", liderId:"", anfitriao:"", endereco:"", bairro:"", diaSemana:"MONDAY", horario:"19:30" };
  const [form, setForm] = useState(formInicial);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const [resCelulas, resUsuarios] = await Promise.all([
        api.get("/celulas"),
        api.get("/usuarios"),
      ]);
      setCelulas(Array.isArray(resCelulas.data) ? resCelulas.data : []);
      setLideresDisponiveis(Array.isArray(resUsuarios.data) ? resUsuarios.data : []);
    } catch (err) { console.error("Erro ao carregar dados:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const abrirModalNovo = () => { setEditandoId(null); setForm(formInicial); setIsModalOpen(true); };
  const abrirModalEdicao = (c) => {
    setEditandoId(c.id);
    setForm({ nome:c.nome||"", liderId:c.liderId||"", anfitriao:c.anfitriao||"",
      endereco:c.endereco||"", bairro:c.bairro||"", diaSemana:c.diaSemana||"MONDAY", horario:c.horario||"19:30" });
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    const dadosParaEnviar = { ...form, liderId:Number(form.liderId), bairro:form.bairro.trim(), nome:form.nome.trim() };
    try {
      if (editandoId) await api.put(`/celulas/${editandoId}`, dadosParaEnviar);
      else            await api.post("/celulas", dadosParaEnviar);
      fecharModal(); carregarDados();
    } catch (err) { alert(err.response?.data?.message || "Erro ao salvar."); }
  };

  const fecharModal = () => { setIsModalOpen(false); setForm(formInicial); setEditandoId(null); };

  const celulasFiltradas = celulas.filter(c =>
      c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nomeLider?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.bairro?.toLowerCase().includes(filtro.toLowerCase())
  );

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
  const inputBg     = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";

  const styles = `
    @keyframes spin { to{transform:rotate(360deg)} }
    .spin-icon { animation:spin 1s linear infinite; }
    .ieq-field {
      width:100%; background:${inputBg};
      border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      color:${textPrimary}; padding:12px 14px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
    }
    .ieq-field:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-field::placeholder { color:${isDark?"rgba(245,240,232,.25)":"rgba(26,10,13,.3)"}; }
    .ieq-celula-card {
      background:${cardBg}; border:1px solid ${border}; border-radius:12px;
      padding:20px; cursor:pointer; transition:all .3s;
      backdrop-filter:blur(24px);
    }
    .ieq-celula-card:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(200,16,46,.15); border-color:${IEQ.red}; }
    .ieq-label { font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:.2em; color:${textSec}; text-transform:uppercase; display:block; margin-bottom:6px; }
    .ieq-modal-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end; justify-content:center; }
    @media(min-width:520px){ .ieq-modal-backdrop{align-items:center; padding:12px;} }
    .ieq-modal-box { position:relative; z-index:10; width:100%; max-height:90vh; display:flex; flex-direction:column; border-radius:16px 16px 0 0; overflow:hidden; }
    @media(min-width:520px){ .ieq-modal-box{border-radius:14px; max-height:calc(100vh - 24px);} }
    .ieq-grid-celulas { display:grid; grid-template-columns:1fr; gap:14px; }
    @media(min-width:560px){ .ieq-grid-celulas{grid-template-columns:repeat(2,1fr);} }
    @media(min-width:900px){ .ieq-grid-celulas{grid-template-columns:repeat(3,1fr);} }
    .ieq-form-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    @media(max-width:400px){ .ieq-form-grid2{grid-template-columns:1fr;} }
  `;

  return (
      <div style={{ padding:"24px 20px", fontFamily:"'EB Garamond',serif", color:textPrimary, position:"relative" }}>
        <style>{styles}</style>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:10, background:`${green}22`, display:"flex", alignItems:"center", justifyContent:"center", color:green }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>CÉLULAS</h3>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".18em", color:textSec, margin:0 }}>{celulas.length} COMUNIDADES</p>
            </div>
          </div>
          <button onClick={abrirModalNovo}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:8, border:"none", cursor:"pointer",
                    background:`linear-gradient(135deg,${green},#065f46)`, color:"#fff",
                    fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".16em", transition:"all .25s" }}
                  onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
                  onMouseLeave={e=>e.currentTarget.style.filter="brightness(1)"}>
            <Plus size={15}/> NOVA CÉLULA
          </button>
        </div>

        {/* Busca */}
        <div style={{ position:"relative", marginBottom:20 }}>
          <Search size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:IEQ.red, opacity:.6 }} />
          <input className="ieq-field" style={{ paddingLeft:42 }}
                 placeholder="Buscar célula, líder ou bairro..."
                 value={filtro} onChange={e => setFiltro(e.target.value)} />
        </div>

        {/* Lista */}
        {loading ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <Loader2 size={30} className="spin-icon" style={{ color:IEQ.red, display:"inline-block" }} />
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:textSec, marginTop:12 }}>CARREGANDO...</p>
            </div>
        ) : (
            <motion.div className="ieq-grid-celulas" initial="hidden" animate="visible"
                        variants={{ hidden:{}, visible:{ transition:{staggerChildren:.06} } }}>
              {celulasFiltradas.map(c => (
                  <motion.div key={c.id} className="ieq-celula-card"
                              variants={{ hidden:{opacity:0,y:16}, visible:{opacity:1,y:0} }}
                              onClick={() => abrirModalEdicao(c)}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                      <div>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:99,
                    background:`${green}18`, color:green, border:`1px solid ${green}44`,
                    fontFamily:"'Cinzel',serif", fontSize:8.5, fontWeight:700, letterSpacing:".14em", marginBottom:6 }}>
                    {DIAS[c.diaSemana] || c.diaSemana}
                  </span>
                        <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, letterSpacing:".12em", color:textPrimary, margin:0 }}>
                          {c.nome?.toUpperCase()}
                        </h4>
                      </div>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:isDark?"rgba(255,255,255,.05)":"rgba(200,16,46,.06)",
                        display:"flex", alignItems:"center", justifyContent:"center", color:textSec, transition:"all .25s",
                        border:`1px solid ${border}` }}>
                        <ChevronRight size={15} />
                      </div>
                    </div>

                    <div style={{ borderTop:`1px solid ${border}`, paddingTop:14, display:"flex", flexDirection:"column", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:6, background:isDark?"rgba(255,255,255,.04)":"rgba(200,16,46,.06)",
                          display:"flex", alignItems:"center", justifyContent:"center", color:IEQ.red, opacity:.7 }}>
                          <User size={13} />
                        </div>
                        <div>
                          <span className="ieq-label" style={{ marginBottom:1 }}>LÍDER</span>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, fontWeight:500, color:textPrimary, margin:0 }}>{c.nomeLider || "Pendente"}</p>
                        </div>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:6, background:isDark?"rgba(255,255,255,.04)":"rgba(200,16,46,.06)",
                          display:"flex", alignItems:"center", justifyContent:"center", color:IEQ.red, opacity:.7 }}>
                          <MapPin size={13} />
                        </div>
                        <div>
                          <span className="ieq-label" style={{ marginBottom:1 }}>BAIRRO</span>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, fontWeight:500, color:textPrimary, margin:0 }}>{c.bairro || "Não informado"}</p>
                        </div>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                        background:isDark?"rgba(255,255,255,.03)":"rgba(200,16,46,.04)", padding:"10px 12px",
                        borderRadius:8, border:`1px solid ${border}`, marginTop:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <Clock size={13} style={{ color:green }} />
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:textPrimary }}>{c.horario}h</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <Calendar size={13} style={{ color:green }} />
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em", color:textSec }}>SEMANAL</span>
                        </div>
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
                            style={{ position:"fixed", inset:0, background:"rgba(10,6,8,.85)", backdropFilter:"blur(16px)", zIndex:0 }} />
                <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}}
                            className="ieq-modal-box"
                            style={{ maxWidth:480, background:cardBg, border:`1px solid ${border}`, backdropFilter:"blur(24px)" }}>
                  <div style={{ padding:"22px 22px 0", overflowY:"auto", flex:1 }}>

                    {/* Modal header */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                      <div>
                        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:".16em", color:textPrimary, margin:0 }}>
                          {editandoId ? "EDITAR CÉLULA" : "NOVA CÉLULA"}
                        </h2>
                        <div style={{ height:2, width:40, background:`linear-gradient(90deg,${IEQ.red},${IEQ.yellow})`, borderRadius:99, marginTop:6 }} />
                      </div>
                      <button onClick={fecharModal} style={{ background:"none", border:"none", cursor:"pointer", color:textSec, padding:4 }}>
                        <X size={20}/>
                      </button>
                    </div>

                    <form onSubmit={salvar} style={{ display:"flex", flexDirection:"column", gap:14, paddingBottom:24 }}>

                      <div>
                        <label className="ieq-label">IDENTIFICAÇÃO</label>
                        <input required className="ieq-field" placeholder="Nome da célula"
                               value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} />
                      </div>

                      <div>
                        <label className="ieq-label">LIDERANÇA</label>
                        <select required className="ieq-field"
                                value={form.liderId} onChange={e=>setForm({...form,liderId:e.target.value})}>
                          <option value="">Selecionar líder</option>
                          {lideresDisponiveis.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                        </select>
                      </div>

                      <div className="ieq-form-grid2">
                        <div>
                          <label className="ieq-label">BAIRRO</label>
                          <input required className="ieq-field" value={form.bairro}
                                 onChange={e=>setForm({...form,bairro:e.target.value})} />
                        </div>
                        <div>
                          <label className="ieq-label">HORÁRIO</label>
                          <input type="time" className="ieq-field" value={form.horario}
                                 onChange={e=>setForm({...form,horario:e.target.value})} />
                        </div>
                      </div>

                      <div className="ieq-form-grid2">
                        <div>
                          <label className="ieq-label">ANFITRIÃO</label>
                          <input className="ieq-field" value={form.anfitriao}
                                 onChange={e=>setForm({...form,anfitriao:e.target.value})} />
                        </div>
                        <div>
                          <label className="ieq-label">DIA DA SEMANA</label>
                          <select className="ieq-field" value={form.diaSemana}
                                  onChange={e=>setForm({...form,diaSemana:e.target.value})}>
                            {Object.entries(DIAS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="ieq-label">LOCALIZAÇÃO</label>
                        <input className="ieq-field" placeholder="Rua, número, etc..."
                               value={form.endereco} onChange={e=>setForm({...form,endereco:e.target.value})} />
                      </div>

                      <div style={{ display:"flex", gap:10, paddingTop:4 }}>
                        <button type="button" onClick={fecharModal}
                                style={{ flex:1, padding:"13px 0", borderRadius:8, border:`1px solid ${border}`, cursor:"pointer",
                                  background:"transparent", color:textSec, fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:".14em" }}>
                          CANCELAR
                        </button>
                        <button type="submit"
                                style={{ flex:2, padding:"13px 0", borderRadius:8, border:"none", cursor:"pointer",
                                  background:`linear-gradient(135deg,${green},#065f46)`, color:"#fff",
                                  fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, letterSpacing:".14em" }}>
                          {editandoId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR CADASTRO"}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Plus, X, User, Clock, Search, ChevronRight, Loader2,
  Calendar, MapPin, Building2,
} from "lucide-react";

/* ─── Tokens ─── */
const IEQ = {
  red:"#C8102E", redDark:"#8B0B1F",
  yellow:"#FDB813", blue:"#003DA5", blueDark:"#002470",
  offWhite:"#F5F0E8",
};
const green = "#059669";

const DIAS = {
  MONDAY:"Segunda", TUESDAY:"Terça",  WEDNESDAY:"Quarta",
  THURSDAY:"Quinta", FRIDAY:"Sexta", SATURDAY:"Sábado", SUNDAY:"Domingo",
};

const formInicial = {
  nome:"", liderId:"", anfitriao:"", endereco:"",
  bairro:"", diaSemana:"MONDAY", horario:"19:30",
};

/* ══════════════════════════════════════
   MODAL — componente isolado via Portal
══════════════════════════════════════ */
function CelulaModal({ isDark, editandoId, form, setForm, lideresDisponiveis, onSalvar, onFechar }) {
  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const bg          = isDark ? "#0f0a0c" : "#ffffff";
  const border      = isDark ? "rgba(200,16,46,.18)" : "rgba(200,16,46,.14)";
  const inputBg     = isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.03)";

  const f = v => setForm(p => ({ ...p, ...v }));

  const css = `
    .cf-wrap {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; flex-direction: column;
      background: ${bg};
      font-family: 'EB Garamond', serif;
      color: ${textPrimary};
    }
    .cf-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid ${border};
      flex-shrink: 0;
      background: ${bg};
    }
    .cf-body {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      padding: 20px 20px max(20px, env(safe-area-inset-bottom, 20px));
      display: flex; flex-direction: column; gap: 14px;
    }
    .cf-field {
      width: 100%; box-sizing: border-box;
      background: ${inputBg};
      border: 1px solid ${isDark ? "rgba(200,16,46,.22)" : "rgba(200,16,46,.18)"};
      color: ${textPrimary};
      padding: 11px 14px; border-radius: 8px;
      outline: none; font-family: 'EB Garamond', serif; font-size: 15px;
      transition: border-color .2s, box-shadow .2s;
      -webkit-appearance: none; appearance: none;
    }
    .cf-field:focus {
      border-color: ${IEQ.red};
      box-shadow: 0 0 0 3px rgba(200,16,46,.1);
    }
    .cf-field::placeholder { color: ${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.28)"}; }
    .cf-label {
      font-family: 'Cinzel', serif; font-size: 8px; letter-spacing: .2em;
      text-transform: uppercase; color: ${textSec};
      display: block; margin-bottom: 5px;
    }
    .cf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media(max-width:380px) { .cf-grid2 { grid-template-columns: 1fr; } }
    .cf-btn-save {
      flex: 2; padding: 13px 0; border-radius: 8px; border: none; cursor: pointer;
      background: linear-gradient(135deg, ${green}, #065f46);
      color: #fff; font-family: 'Cinzel', serif;
      font-size: 10px; font-weight: 700; letter-spacing: .14em;
    }
    .cf-btn-cancel {
      flex: 1; padding: 13px 0; border-radius: 8px; cursor: pointer;
      background: transparent;
      border: 1px solid ${border};
      color: ${textSec}; font-family: 'Cinzel', serif;
      font-size: 9px; font-weight: 700; letter-spacing: .14em;
    }
  `;

  const content = (
      <>
        <style>{css}</style>
        <motion.div
            className="cf-wrap"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
        >
          {/* Header */}
          <div className="cf-header">
            <button onClick={onFechar}
                    style={{ background:"none", border:"none", cursor:"pointer",
                      color:textSec, display:"flex", alignItems:"center", gap:6,
                      fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".14em" }}>
              <X size={18}/> VOLTAR
            </button>
            <div style={{ textAlign:"right" }}>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700,
                letterSpacing:".14em", color:textPrimary, margin:0 }}>
                {editandoId ? "EDITAR CÉLULA" : "NOVA CÉLULA"}
              </h2>
              <div style={{ height:2, width:32,
                background:`linear-gradient(90deg,${IEQ.red},${IEQ.yellow})`,
                borderRadius:99, marginTop:5, marginLeft:"auto" }} />
            </div>
          </div>

          {/* Body com scroll */}
          <form className="cf-body" onSubmit={onSalvar}>

            <div>
              <label className="cf-label">IDENTIFICAÇÃO</label>
              <input required className="cf-field" placeholder="Nome da célula"
                     value={form.nome} onChange={e => f({ nome: e.target.value })} />
            </div>

            <div>
              <label className="cf-label">LIDERANÇA</label>
              <select required className="cf-field"
                      value={form.liderId} onChange={e => f({ liderId: e.target.value })}>
                <option value="">Selecionar líder</option>
                {lideresDisponiveis.map(u =>
                    <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>

            <div className="cf-grid2">
              <div>
                <label className="cf-label">BAIRRO</label>
                <input required className="cf-field"
                       value={form.bairro} onChange={e => f({ bairro: e.target.value })} />
              </div>
              <div>
                <label className="cf-label">HORÁRIO</label>
                <input type="time" className="cf-field"
                       value={form.horario} onChange={e => f({ horario: e.target.value })} />
              </div>
            </div>

            <div className="cf-grid2">
              <div>
                <label className="cf-label">ANFITRIÃO</label>
                <input className="cf-field"
                       value={form.anfitriao} onChange={e => f({ anfitriao: e.target.value })} />
              </div>
              <div>
                <label className="cf-label">DIA DA SEMANA</label>
                <select className="cf-field"
                        value={form.diaSemana} onChange={e => f({ diaSemana: e.target.value })}>
                  {Object.entries(DIAS).map(([v, l]) =>
                      <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="cf-label">LOCALIZAÇÃO</label>
              <input className="cf-field" placeholder="Rua, número, etc..."
                     value={form.endereco} onChange={e => f({ endereco: e.target.value })} />
            </div>

            <div style={{ display:"flex", gap:10, paddingTop:4 }}>
              <button type="button" className="cf-btn-cancel" onClick={onFechar}>
                CANCELAR
              </button>
              <button type="submit" className="cf-btn-save">
                {editandoId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR CADASTRO"}
              </button>
            </div>

          </form>
        </motion.div>
      </>
  );

  return createPortal(content, document.body);
}

/* ══════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════ */
export default function Celulas({ isDark = false }) {
  const [celulas,            setCelulas]            = useState([]);
  const [lideresDisponiveis, setLideresDisponiveis] = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [editandoId,         setEditandoId]         = useState(null);
  const [filtro,             setFiltro]             = useState("");
  const [form,               setForm]               = useState(formInicial);

  const textPrimary = isDark ? IEQ.offWhite : "#1A0A0D";
  const textSec     = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const cardBg      = isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)";
  const border      = isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)";
  const inputBg     = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)";

  const baseStyles = `
    @keyframes spin { to { transform: rotate(360deg) } }
    .spin-icon { animation: spin 1s linear infinite; }
    .ieq-field {
      width: 100%; box-sizing: border-box;
      background: ${inputBg};
      border: 1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color: ${textPrimary}; padding: 12px 14px; border-radius: 8px;
      outline: none; font-family: 'EB Garamond', serif; font-size: 15px;
      transition: all .25s; -webkit-appearance: none; appearance: none;
    }
    .ieq-field:focus { border-color: ${IEQ.red}; box-shadow: 0 0 0 3px rgba(200,16,46,.12); }
    .ieq-field::placeholder { color: ${isDark ? "rgba(245,240,232,.25)" : "rgba(26,10,13,.3)"}; }
    .ieq-celula-card {
      background: ${cardBg}; border: 1px solid ${border}; border-radius: 12px;
      padding: 20px; cursor: pointer; transition: all .3s; backdrop-filter: blur(24px);
    }
    .ieq-celula-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 36px rgba(200,16,46,.15); border-color: ${IEQ.red};
    }
    .ieq-label {
      font-family: 'Cinzel', serif; font-size: 8.5px; letter-spacing: .2em;
      color: ${textSec}; text-transform: uppercase; display: block; margin-bottom: 6px;
    }
    .ieq-grid-celulas { display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media(min-width:560px) { .ieq-grid-celulas { grid-template-columns: repeat(2,1fr); } }
    @media(min-width:900px) { .ieq-grid-celulas { grid-template-columns: repeat(3,1fr); } }
  `;

  /* ── API ── */
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const [resCelulas, resUsuarios] = await Promise.all([
        api.get("/celulas"),
        api.get("/usuarios"),
      ]);
      setCelulas(Array.isArray(resCelulas.data) ? resCelulas.data : []);
      setLideresDisponiveis(Array.isArray(resUsuarios.data) ? resUsuarios.data : []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  /* ── Handlers ── */
  const abrirNovo = () => {
    setEditandoId(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirEdicao = (c) => {
    setEditandoId(c.id);
    // null safety — nenhum campo pode chegar null no input
    setForm({
      nome:      c.nome      ?? "",
      liderId:   c.liderId   ?? "",
      anfitriao: c.anfitriao ?? "",
      endereco:  c.endereco  ?? "",
      bairro:    c.bairro    ?? "",
      diaSemana: c.diaSemana ?? "MONDAY",
      horario:   c.horario   ?? "19:30",
    });
    setIsModalOpen(true);
  };

  const fecharModal = () => { setIsModalOpen(false); setForm(formInicial); setEditandoId(null); };

  const salvar = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      liderId: Number(form.liderId),
      bairro:  form.bairro.trim(),
      nome:    form.nome.trim(),
    };
    try {
      if (editandoId) await api.put(`/celulas/${editandoId}`, payload);
      else            await api.post("/celulas", payload);
      fecharModal();
      carregarDados();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert(err.response?.data?.message || "Erro ao salvar.");
    }
  };

  const celulasFiltradas = celulas.filter(c =>
      c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nomeLider?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.bairro?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
      <div style={{ padding:"24px 20px", fontFamily:"'EB Garamond',serif", color:textPrimary }}>
        <style>{baseStyles}</style>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:10, background:`${green}22`,
              display:"flex", alignItems:"center", justifyContent:"center", color:green }}>
              <Building2 size={20}/>
            </div>
            <div>
              <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700,
                letterSpacing:".16em", color:textPrimary, margin:0 }}>CÉLULAS</h3>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9,
                letterSpacing:".18em", color:textSec, margin:0 }}>{celulas.length} COMUNIDADES</p>
            </div>
          </div>
          <button onClick={abrirNovo}
                  onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                  onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px",
                    borderRadius:8, border:"none", cursor:"pointer",
                    background:`linear-gradient(135deg,${green},#065f46)`,
                    color:"#fff", fontFamily:"'Cinzel',serif",
                    fontSize:10, fontWeight:700, letterSpacing:".16em", transition:"all .25s" }}>
            <Plus size={15}/> NOVA CÉLULA
          </button>
        </div>

        {/* Busca */}
        <div style={{ position:"relative", marginBottom:20 }}>
          <Search size={15} style={{ position:"absolute", left:14, top:"50%",
            transform:"translateY(-50%)", color:IEQ.red, opacity:.6 }}/>
          <input className="ieq-field" style={{ paddingLeft:42 }}
                 placeholder="Buscar célula, líder ou bairro..."
                 value={filtro} onChange={e => setFiltro(e.target.value)}/>
        </div>

        {/* Lista */}
        {loading ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <Loader2 size={30} className="spin-icon" style={{ color:IEQ.red, display:"inline-block" }}/>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:9,
                letterSpacing:".2em", color:textSec, marginTop:12 }}>CARREGANDO...</p>
            </div>
        ) : (
            <motion.div className="ieq-grid-celulas" initial="hidden" animate="visible"
                        variants={{ hidden:{}, visible:{ transition:{ staggerChildren:.06 } } }}>
              {celulasFiltradas.map(c => (
                  <motion.div key={c.id} className="ieq-celula-card"
                              variants={{ hidden:{ opacity:0, y:16 }, visible:{ opacity:1, y:0 } }}
                              onClick={() => abrirEdicao(c)}>

                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"flex-start", marginBottom:14 }}>
                      <div>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4,
                    padding:"3px 10px", borderRadius:99,
                    background:`${green}18`, color:green, border:`1px solid ${green}44`,
                    fontFamily:"'Cinzel',serif", fontSize:8.5, fontWeight:700,
                    letterSpacing:".14em", marginBottom:6 }}>
                    {DIAS[c.diaSemana] || c.diaSemana}
                  </span>
                        <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700,
                          letterSpacing:".12em", color:textPrimary, margin:0 }}>
                          {c.nome?.toUpperCase()}
                        </h4>
                      </div>
                      <div style={{ width:30, height:30, borderRadius:"50%",
                        background:isDark?"rgba(255,255,255,.05)":"rgba(200,16,46,.06)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        color:textSec, border:`1px solid ${border}` }}>
                        <ChevronRight size={15}/>
                      </div>
                    </div>

                    <div style={{ borderTop:`1px solid ${border}`, paddingTop:14,
                      display:"flex", flexDirection:"column", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:6,
                          background:isDark?"rgba(255,255,255,.04)":"rgba(200,16,46,.06)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color:IEQ.red, opacity:.7 }}>
                          <User size={13}/>
                        </div>
                        <div>
                          <span className="ieq-label" style={{ marginBottom:1 }}>LÍDER</span>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14,
                            fontWeight:500, color:textPrimary, margin:0 }}>
                            {c.nomeLider || "Pendente"}
                          </p>
                        </div>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:6,
                          background:isDark?"rgba(255,255,255,.04)":"rgba(200,16,46,.06)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color:IEQ.red, opacity:.7 }}>
                          <MapPin size={13}/>
                        </div>
                        <div>
                          <span className="ieq-label" style={{ marginBottom:1 }}>BAIRRO</span>
                          <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14,
                            fontWeight:500, color:textPrimary, margin:0 }}>
                            {c.bairro || "Não informado"}
                          </p>
                        </div>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                        background:isDark?"rgba(255,255,255,.03)":"rgba(200,16,46,.04)",
                        padding:"10px 12px", borderRadius:8, border:`1px solid ${border}`, marginTop:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <Clock size={13} style={{ color:green }}/>
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:11,
                            fontWeight:700, color:textPrimary }}>{c.horario}h</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <Calendar size={13} style={{ color:green }}/>
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:9,
                            letterSpacing:".12em", color:textSec }}>SEMANAL</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </motion.div>
        )}

        {/* Modal via Portal */}
        <AnimatePresence>
          {isModalOpen && (
              <CelulaModal
                  isDark={isDark}
                  editandoId={editandoId}
                  form={form}
                  setForm={setForm}
                  lideresDisponiveis={lideresDisponiveis}
                  onSalvar={salvar}
                  onFechar={fecharModal}
              />
          )}
        </AnimatePresence>
      </div>
  );
}
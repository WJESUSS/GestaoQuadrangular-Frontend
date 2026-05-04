import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { Loader2, Save, User, Calendar, Wallet, Trophy, AlertCircle, CheckCircle2 } from "lucide-react";

const C = {
  red:"#C8102E", redDark:"#8B0B1F", yellow:"#FDB813", yellowDark:"#C48C00",
  blue:"#003DA5", blueDark:"#002470", blueLight:"#1A56C4",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes zoomIn { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }

  .tl-root { animation: fadeUp .5s ease; }

  .tl-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(200,16,46,.12);
    border-radius: 14px;
    backdrop-filter: blur(24px);
    padding: 28px 22px;
  }
  @media (min-width: 600px) { .tl-card { padding: 36px 32px; } }

  .tl-label {
    display:flex; align-items:center; gap:8px; margin-bottom:8px;
    font-family:'Cinzel',serif; font-size:9px; font-weight:700;
    text-transform:uppercase; letter-spacing:.22em; color:rgba(26,10,13,.45);
  }

  .tl-input {
    width:100%;
    background: rgba(200,16,46,.03);
    border: 1px solid rgba(200,16,46,.16);
    color: #1A0A0D;
    padding: 13px 16px; border-radius:8px; outline:none;
    font-family:'EB Garamond',serif; font-size:15px;
    transition: all .25s;
    appearance: none; -webkit-appearance: none;
  }
  .tl-input:focus { border-color:#C8102E; box-shadow:0 0 0 3px rgba(200,16,46,.1); }
  .tl-input::placeholder { color:rgba(26,10,13,.3); }

  .tl-btn-save {
    width:100%; background: linear-gradient(135deg, #8B0B1F, #C8102E);
    color:#fff; border:none; border-radius:10px;
    font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.2em;
    cursor:pointer; transition: all .3s; padding:16px 24px;
    display:flex; align-items:center; justify-content:center; gap:10px;
    position:relative; overflow:hidden;
  }
  .tl-btn-save:not(:disabled):hover { transform:translateY(-2px); filter:brightness(1.1); }
  .tl-btn-save:disabled { background: rgba(200,16,46,.18); cursor:not-allowed; color:rgba(26,10,13,.35); }
  .tl-btn-save .shine {
    position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent);
    transform:translateX(-100%); transition: transform 1s;
  }
  .tl-btn-save:hover .shine { transform:translateX(100%); }

  .tl-tipo-btn {
    flex:1; padding:11px 8px; border-radius:8px;
    font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.18em;
    text-transform:uppercase; cursor:pointer; border:none; transition:all .25s;
  }
  .tl-tipo-btn.active {
    background: linear-gradient(135deg, #8B0B1F, #C8102E);
    color:#fff; box-shadow: 0 4px 14px rgba(200,16,46,.28);
  }
  .tl-tipo-btn.inactive {
    background: rgba(200,16,46,.06);
    color: rgba(26,10,13,.45);
  }
  .tl-tipo-btn.inactive:hover { background: rgba(200,16,46,.1); color:#8B0B1F; }

  .tl-alert {
    display:flex; align-items:center; gap:10px;
    padding:14px 16px; border-radius:10px;
    font-family:'EB Garamond',serif; font-size:14px; font-weight:500;
    animation: zoomIn .3s ease;
  }
  .tl-alert.error  { background:rgba(200,16,46,.07); border:1px solid rgba(200,16,46,.2); color:#8B0B1F; }
  .tl-alert.success{ background:rgba(0,61,165,.07);  border:1px solid rgba(0,61,165,.2);  color:#002470; }

  /* grid 2 colunas em desktop */
  .tl-form-grid {
    display:grid; grid-template-columns:1fr; gap:20px; margin-bottom:24px;
  }
  @media (min-width:520px) {
    .tl-form-grid { grid-template-columns:repeat(2,1fr); }
    .tl-full { grid-column: 1 / -1; }
  }

  .tl-prefix {
    position:absolute; left:14px; top:50%; transform:translateY(-50%);
    font-family:'Cinzel',serif; font-size:11px; font-weight:700; color:rgba(26,10,13,.4);
    pointer-events:none;
  }
  .tl-input-prefix { padding-left: 38px !important; }

  .spin-tl { animation: spin 1s linear infinite; }
`;

export default function TesourariaLancamento() {
  const [membros,  setMembros]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [erro,     setErro]     = useState(null);
  const [sucesso,  setSucesso]  = useState(false);

  const [form, setForm] = useState({
    membroNome: "", valorDizimo: "", valorOferta: "",
    tipoOferta: "BRONZE", dataLancamento: new Date().toISOString().split("T")[0],
  });

  const limparValor = (s) => {
    const n = Number((s || "").toString().replace(",", ".").trim());
    return isNaN(n) ? 0 : n;
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/tesouraria/select-nome");
        setMembros(res.data || []);
      } catch { setErro("Erro ao carregar lista de membros."); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSalvar = async () => {
    setErro(null); setSucesso(false);
    if (!form.membroNome) return setErro("Selecione um membro para continuar.");
    const vD = limparValor(form.valorDizimo), vO = limparValor(form.valorOferta);
    if (vD <= 0 && vO <= 0) return setErro("Informe pelo menos um valor de Dízimo ou Oferta.");
    setLoading(true);
    try {
      await api.post("/tesouraria/lancar", {
        membroNome: form.membroNome,
        valorDizimo: vD > 0 ? vD : null,
        valorOferta: vO > 0 ? vO : null,
        tipoOferta: vO > 0 ? form.tipoOferta : null,
        dataLancamento: form.dataLancamento,
      });
      setSucesso(true);
      setForm({ membroNome:"", valorDizimo:"", valorOferta:"", tipoOferta:"BRONZE", dataLancamento: new Date().toISOString().split("T")[0] });
      setTimeout(() => setSucesso(false), 4000);
    } catch { setErro("Erro ao registrar lançamento no servidor."); }
    finally { setLoading(false); }
  };

  return (
      <>
        <style>{CSS}</style>
        <div className="tl-root" style={{ maxWidth:720, margin:"0 auto", padding:"16px 4px" }}>

          {/* ── HEADER ── */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".25em", textTransform:"uppercase", color:C.red, fontWeight:700, marginBottom:8 }}>
              REGISTRO DE ENTRADA
            </p>
            <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:700, letterSpacing:".06em", color:"#1A0A0D", margin:0, lineHeight:1.1 }}>
              Lançamento
            </h2>
          </div>

          <div className="tl-card">
            {/* Feedbacks */}
            {erro    && <div className="tl-alert error"  style={{ marginBottom:20 }}><AlertCircle  size={18}/>{erro}</div>}
            {sucesso && <div className="tl-alert success" style={{ marginBottom:20 }}><CheckCircle2 size={18}/>Lançamento registrado com sucesso!</div>}

            <div className="tl-form-grid">
              {/* Membro */}
              <div className="tl-full">
                <label className="tl-label"><User size={12}/> Membro Responsável</label>
                <select className="tl-input" value={form.membroNome} onChange={e => setForm({...form, membroNome:e.target.value})}>
                  <option value="">Selecione na lista...</option>
                  {membros.map((m,i) => <option key={i} value={m.nome}>{m.nome}</option>)}
                </select>
              </div>

              {/* Data */}
              <div>
                <label className="tl-label"><Calendar size={12}/> Data do Evento</label>
                <input type="date" className="tl-input" value={form.dataLancamento} onChange={e => setForm({...form, dataLancamento:e.target.value})} />
              </div>

              {/* Dízimo */}
              <div>
                <label className="tl-label"><Wallet size={12}/> Valor Dízimo</label>
                <div style={{ position:"relative" }}>
                  <span className="tl-prefix">R$</span>
                  <input type="text" className="tl-input tl-input-prefix" placeholder="0,00" value={form.valorDizimo} onChange={e => setForm({...form, valorDizimo:e.target.value})} />
                </div>
              </div>

              {/* Oferta */}
              <div>
                <label className="tl-label"><Trophy size={12}/> Valor Oferta</label>
                <div style={{ position:"relative" }}>
                  <span className="tl-prefix">R$</span>
                  <input type="text" className="tl-input tl-input-prefix" placeholder="0,00" value={form.valorOferta} onChange={e => setForm({...form, valorOferta:e.target.value})} />
                </div>
              </div>

              {/* Tipo */}
              <div className="tl-full">
                <label className="tl-label">Categoria Especial</label>
                <div style={{ display:"flex", gap:8, background:"rgba(200,16,46,.06)", padding:6, borderRadius:10, border:"1px solid rgba(200,16,46,.12)" }}>
                  {["BRONZE","PRATA","OURO"].map(tipo => (
                      <button key={tipo} className={`tl-tipo-btn ${form.tipoOferta === tipo ? "active" : "inactive"}`}
                              onClick={() => setForm({...form, tipoOferta:tipo})}>
                        {tipo}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão */}
            <button className="tl-btn-save" onClick={handleSalvar} disabled={loading}>
              <span className="shine" />
              {loading
                  ? <Loader2 size={18} className="spin-tl" />
                  : <><Save size={16}/> CONFIRMAR LANÇAMENTO</>
              }
            </button>
          </div>

          <p style={{ textAlign:"center", marginTop:20, fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".2em", color:"rgba(26,10,13,.3)", textTransform:"uppercase" }}>
            Todos os dados são criptografados e auditáveis
          </p>
        </div>
      </>
  );
}
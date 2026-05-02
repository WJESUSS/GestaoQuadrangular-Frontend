import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Calendar, Users, BookOpen, Heart, AlertCircle,
  Loader2, RefreshCw, CheckCircle2, FileText,
} from "lucide-react";

/* ─── Cores Oficiais IEQ ─── */
const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

function QuadrangularCross({ size = 28 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVF" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} /><stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHF" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} /><stop offset="50%" stopColor={IEQ.blueLight} /><stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowF"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="38" y="4" width="24" height="92" rx="3" fill="url(#gVF)" filter="url(#glowF)" />
        <rect x="4" y="38" width="92" height="24" rx="3" fill="url(#gHF)" filter="url(#glowF)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowF)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

export default function TelaFichas({ celula = {}, onSuccess, isDark = false }) {
  const initialState = {
    nome: "", dataNascimento: "", endereco: "", bairro: "", cidade: "",
    telefone: "", sexo: "", estadoCivil: "", rg: "", estado: "",
    tomaMedicamento: false, qualMedicamento: "",
    temProblemasSaude: false, qualProblemaSaude: "",
    temApneia: false, peso: "", altura: "",
    nomeLiderCelula: celula?.nome || "Líder da Célula",
    nomeFamiliarContato: "", telefoneFamiliarContato: "",
    aceitouJesus: false, jaEraCristao: false,
    nomeEncontro: "Encontro com Deus",
    localEncontro: "Centro de Treinamento",
    dataInicio: new Date().toISOString().split("T")[0],
    dataFim: "",
    frequentaCelula: false, nomeCelula: celula?.nome || "",
    outrosParticipantes: "", tipoEncontro: "ENCONTRO_COM_DEUS",
    nomeConvidador: celula?.lider?.nome || "Líder da Célula",
    celulaConvidador: celula?.nome || "Minha Célula",
  };

  const [form, setForm] = useState(initialState);
  const [minhasFichas, setMinhasFichas] = useState([]);
  const [loadingFichas, setLoadingFichas] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const carregarMinhasFichas = useCallback(async () => {
    try {
      setLoadingFichas(true);
      const res = await api.get("/fichas-encontro/minhas-fichas");
      setMinhasFichas(res.data || []);
    } catch (err) { console.error(err); } finally { setLoadingFichas(false); }
  }, []);

  useEffect(() => { carregarMinhasFichas(); }, [carregarMinhasFichas]);

  useEffect(() => {
    if (form.dataInicio) {
      const inicio = new Date(form.dataInicio);
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 3);
      setForm(prev => ({ ...prev, dataFim: fim.toISOString().split("T")[0] }));
    }
  }, [form.dataInicio]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!form.nome?.trim() || !form.dataNascimento || !form.telefone?.trim()) {
      alert("Nome, Data de Nascimento e Telefone são obrigatórios.");
      return;
    }
    setEnviando(true);
    try {
      const dadosParaEnviar = {
        ...form,
        peso: form.peso ? parseFloat(form.peso) : null,
        altura: form.altura ? parseFloat(form.altura) : null,
        tipoEncontro: form.tipoEncontro || "ENCONTRO_COM_DEUS",
        frequentaCelula: !!form.nomeCelula?.trim(),
        dataFim: form.dataFim || form.dataInicio,
      };
      const response = await api.post("/fichas-encontro", dadosParaEnviar);
      if (response.status === 201 || response.status === 200) {
        alert("Inscrição realizada com sucesso!");
        if (onSuccess) onSuccess();
        setForm(initialState);
        carregarMinhasFichas();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao conectar com o servidor.");
    } finally { setEnviando(false); }
  };

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing:border-box; }
    @keyframes stripe { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes spin { to{transform:rotate(360deg)} }

    .ieq-bg-stripe {
      position:absolute; inset:0; pointer-events:none;
      background:repeating-linear-gradient(-55deg,
        ${isDark?"rgba(200,16,46,.04)":"rgba(200,16,46,.05)"} 0 10px,transparent 10px 20px,
        ${isDark?"rgba(253,184,19,.03)":"rgba(253,184,19,.04)"} 20px 30px,transparent 30px 40px);
      background-size:60px 60px; animation:stripe 8s linear infinite;
    }

    .ieq-section {
      background:${isDark?"rgba(17,10,13,.8)":"rgba(255,255,255,.85)"};
      border:1px solid ${isDark?"rgba(200,16,46,.15)":"rgba(200,16,46,.12)"};
      border-radius:14px; padding:28px 32px;
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
      font-family:'EB Garamond',serif; font-size:15px; cursor:pointer; transition:all .25s;
      appearance:none;
    }
    .ieq-select:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }

    .ieq-label {
      display:block; margin-bottom:6px;
      font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.18em; color:${IEQ.red};
    }

    .ieq-checkbox-row {
      display:flex; align-items:center; gap:12px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:10px; letter-spacing:.12em; color:${tp};
    }
    .ieq-checkbox-row input[type=checkbox] { accent-color:${IEQ.red}; width:18px; height:18px; }

    .ieq-btn-primary {
      background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red}); color:#fff;
      border:none; border-radius:8px; padding:15px 28px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:.2em;
      width:100%; transition:all .25s; display:flex; align-items:center; justify-content:center; gap:10px;
    }
    .ieq-btn-primary:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
    .ieq-btn-primary:disabled { opacity:.5; cursor:not-allowed; }

    .ieq-btn-ghost {
      background:${isDark?"rgba(255,255,255,.04)":"rgba(200,16,46,.06)"};
      border:1px solid ${isDark?"rgba(200,16,46,.2)":"rgba(200,16,46,.18)"};
      color:${isDark?IEQ.offWhite:IEQ.redDark}; border-radius:8px;
      padding:9px 20px; cursor:pointer;
      font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.15em;
      display:flex; align-items:center; gap:8px; transition:all .25s;
    }
    .ieq-btn-ghost:hover:not(:disabled) { border-color:${IEQ.red}; }
    .ieq-btn-ghost:disabled { opacity:.5; }

    .ieq-ficha-card {
      background:${isDark?"rgba(17,10,13,.9)":"rgba(255,255,255,.9)"};
      border:1px solid ${isDark?"rgba(200,16,46,.15)":"rgba(200,16,46,.15)"};
      border-radius:10px; padding:18px 20px; transition:all .25s;
    }
    .ieq-ficha-card:hover { border-color:${IEQ.red}; transform:translateY(-3px); }

    .divider {
      height:1px;
      background:linear-gradient(90deg,transparent,${isDark?"rgba(200,16,46,.25)":"rgba(200,16,46,.2)"},transparent);
      margin:6px 0;
    }
    .spin-icon { animation:spin 1s linear infinite; }
  `;

  const SectionTitle = ({ n, children, color = IEQ.red }) => (
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:12 }}>{n}</div>
        <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, letterSpacing:".18em", color:tp, margin:0 }}>{children}</h3>
      </div>
  );

  return (
      <div style={{ position:"relative", minHeight:"100vh", padding:"0 0 48px" }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-stripe" />

        <div style={{ position:"relative", zIndex:1, maxWidth:800, margin:"0 auto", padding:"0 16px" }}>

          {/* Cabeçalho */}
          <div style={{ textAlign:"center", padding:"36px 0 32px" }}>
            <QuadrangularCross size={40} />
            <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:700, letterSpacing:".18em", color:tp, margin:"14px 0 4px" }}>
              FICHA DE INSCRIÇÃO
            </h2>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:".2em", color:IEQ.red }}>
              {form.nomeEncontro.toUpperCase()} · {form.localEncontro.toUpperCase()}
            </p>
            <div style={{ height:1, background:`linear-gradient(90deg,transparent,${IEQ.red},transparent)`, margin:"20px 0 0" }} />
          </div>

          {/* Minhas fichas */}
          <div className="ieq-section" style={{ marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <FileText size={16} style={{ color:IEQ.red }} />
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:".14em", color:tp }}>MINHAS INSCRIÇÕES</span>
              </div>
              <button className="ieq-btn-ghost" onClick={carregarMinhasFichas} disabled={loadingFichas}>
                <RefreshCw size={14} className={loadingFichas ? "spin-icon" : ""} /> ATUALIZAR
              </button>
            </div>

            {loadingFichas ? (
                <div style={{ textAlign:"center", padding:"24px 0" }}>
                  <Loader2 size={28} style={{ color:IEQ.red, animation:"spin 1s linear infinite" }} />
                </div>
            ) : minhasFichas.length > 0 ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
                  {minhasFichas.map((ficha) => (
                      <div key={ficha.id} className="ieq-ficha-card">
                        <p style={{ fontFamily:"'EB Garamond',serif", fontWeight:600, color:tp, marginBottom:4 }}>{ficha.nome}</p>
                        <p style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".12em", color:ts }}>
                          {new Date(ficha.dataInicio).toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" })}
                        </p>
                        <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, background:"rgba(200,16,46,.1)", border:`1px solid rgba(200,16,46,.25)` }}>
                          <CheckCircle2 size={11} style={{ color:IEQ.red }} />
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:8.5, letterSpacing:".15em", color:IEQ.red }}>ENVIADA</span>
                        </div>
                      </div>
                  ))}
                </div>
            ) : (
                <div style={{ textAlign:"center", padding:"28px 0", color:ts, fontFamily:"'EB Garamond',serif", fontStyle:"italic", fontSize:15 }}>
                  Nenhuma inscrição enviada ainda.
                </div>
            )}
          </div>

          {/* Formulário */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Seção 1: Dados Pessoais */}
            <div className="ieq-section">
              <SectionTitle n="1">DADOS PESSOAIS</SectionTitle>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label className="ieq-label">NOME COMPLETO *</label>
                  <input className="ieq-input" name="nome" value={form.nome} onChange={handleChange} required placeholder="Nome completo" />
                </div>
                <div>
                  <label className="ieq-label">DATA DE NASCIMENTO *</label>
                  <input className="ieq-input" name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} required />
                </div>
                <div>
                  <label className="ieq-label">SEXO</label>
                  <select className="ieq-select" name="sexo" value={form.sexo} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="ieq-label">ESTADO CIVIL</label>
                  <select className="ieq-select" name="estadoCivil" value={form.estadoCivil} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="SOLTEIRO">Solteiro</option>
                    <option value="CASADO">Casado</option>
                    <option value="DIVORCIADO">Divorciado</option>
                    <option value="VIÚVO">Viúvo</option>
                  </select>
                </div>
                <div>
                  <label className="ieq-label">TELEFONE / WHATSAPP *</label>
                  <input className="ieq-input" name="telefone" value={form.telefone} onChange={handleChange} required placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="ieq-label">RG</label>
                  <input className="ieq-input" name="rg" value={form.rg} onChange={handleChange} />
                </div>
                <div>
                  <label className="ieq-label">ESTADO (UF)</label>
                  <input className="ieq-input" name="estado" value={form.estado} onChange={handleChange} maxLength={2} placeholder="BA" style={{ textTransform:"uppercase" }} />
                </div>
              </div>
            </div>

            {/* Seção 2: Localização */}
            <div className="ieq-section" style={{ borderColor: isDark?"rgba(0,61,165,.2)":"rgba(0,61,165,.15)" }}>
              <SectionTitle n="2">LOCALIZAÇÃO</SectionTitle>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label className="ieq-label" style={{ color:IEQ.blue }}>ENDEREÇO (RUA, Nº)</label>
                  <input className="ieq-input" name="endereco" value={form.endereco} onChange={handleChange} />
                </div>
                <div>
                  <label className="ieq-label" style={{ color:IEQ.blue }}>BAIRRO</label>
                  <input className="ieq-input" name="bairro" value={form.bairro} onChange={handleChange} />
                </div>
                <div>
                  <label className="ieq-label" style={{ color:IEQ.blue }}>CIDADE</label>
                  <input className="ieq-input" name="cidade" value={form.cidade} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Seção 3: Saúde */}
            <div className="ieq-section">
              <SectionTitle n="3">SAÚDE E BIOMETRIA</SectionTitle>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <label className="ieq-checkbox-row">
                    <input type="checkbox" name="tomaMedicamento" checked={form.tomaMedicamento} onChange={handleChange} />
                    TOMA ALGUM MEDICAMENTO?
                  </label>
                  {form.tomaMedicamento && (
                      <input className="ieq-input" name="qualMedicamento" value={form.qualMedicamento} onChange={handleChange} placeholder="Quais medicamentos?" />
                  )}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <label className="ieq-checkbox-row">
                    <input type="checkbox" name="temProblemasSaude" checked={form.temProblemasSaude} onChange={handleChange} />
                    PROBLEMAS DE SAÚDE?
                  </label>
                  {form.temProblemasSaude && (
                      <input className="ieq-input" name="qualProblemaSaude" value={form.qualProblemaSaude} onChange={handleChange} placeholder="Quais problemas?" />
                  )}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:20 }}>
                <div>
                  <label className="ieq-label" style={{ textAlign:"center", display:"block" }}>PESO (KG)</label>
                  <input className="ieq-input" name="peso" type="number" step="0.1" value={form.peso} onChange={handleChange} placeholder="00.0" style={{ textAlign:"center", fontWeight:700, fontSize:18 }} />
                </div>
                <div>
                  <label className="ieq-label" style={{ textAlign:"center", display:"block" }}>ALTURA (M)</label>
                  <input className="ieq-input" name="altura" type="number" step="0.01" value={form.altura} onChange={handleChange} placeholder="0.00" style={{ textAlign:"center", fontWeight:700, fontSize:18 }} />
                </div>
              </div>
            </div>

            {/* Seção 4: Vida Espiritual */}
            <div className="ieq-section" style={{ borderColor: isDark?"rgba(0,61,165,.2)":"rgba(0,61,165,.15)" }}>
              <SectionTitle n="4">VIDA ESPIRITUAL</SectionTitle>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { name:"aceitouJesus", label:"JÁ ACEITOU JESUS?" },
                  { name:"jaEraCristao", label:"JÁ ERA CRISTÃO?" },
                ].map(({ name, label }) => (
                    <div key={name} style={{
                      padding:"16px 18px",
                      background: isDark?"rgba(0,61,165,.08)":"rgba(0,61,165,.05)",
                      border:`1px solid ${isDark?"rgba(0,61,165,.2)":"rgba(0,61,165,.15)"}`,
                      borderRadius:8,
                    }}>
                      <label className="ieq-checkbox-row" style={{ color: isDark?IEQ.blueLight:IEQ.blue }}>
                        <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} style={{ accentColor:IEQ.blue }} />
                        {label}
                      </label>
                    </div>
                ))}
              </div>
            </div>

            {/* Botão enviar */}
            <button className="ieq-btn-primary" style={{ marginTop:8 }} onClick={handleSubmit} disabled={enviando}>
              {enviando ? <><Loader2 size={18} className="spin-icon" /> ENVIANDO...</> : "CONCLUIR INSCRIÇÃO"}
            </button>

            <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:".15em", color:ts, marginTop:8 }}>
              © IEQ PITUAÇU · SISTEMA SEGURO · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
  );
}
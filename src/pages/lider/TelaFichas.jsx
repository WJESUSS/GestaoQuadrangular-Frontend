import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Calendar, Loader2, RefreshCw, CheckCircle2, FileText,
  Sparkles, Heart, MapPin, User,
} from "lucide-react";

/* ─── Tokens AURA (mesmos do dashboard) ─── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  dark:      "#0A0A0F",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  blueDark:  "#002470",
  yellow:    "#FDB813",
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
    optionBg:    isDark ? "#12121A"                : "#F0EAE0",
  };
}

function IEQCross({ size = 36 }) {
  return (
      <img
          src="/quadrangular.png"
          alt="Logo IEQ"
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
  );
}

/* ─── CSS Global (segue padrão dl-*) ─── */
function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

      @keyframes dl-spin  { to { transform: rotate(360deg); } }
      @keyframes dl-pulse { 0%,100%{opacity:.2;} 50%{opacity:.05;} }
      .dl-spin  { animation: dl-spin 1s linear infinite; }
      .dl-pulse { animation: dl-pulse 3s ease-in-out infinite; }

      .ff-root {
        font-family: 'Inter', sans-serif;
        position: relative; z-index: 1;
        max-width: 800px; margin: 0 auto;
        padding: 0 0 40px;
      }

      .ff-header { text-align: center; padding: 8px 0 28px; }
      .ff-eyebrow {
        font-size: 9px; font-weight: 600; letter-spacing: .25em;
        text-transform: uppercase; color: rgba(201,169,110,.6);
        margin: 14px 0 6px;
      }
      .ff-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(20px, 5vw, 26px);
        font-weight: 500; color: ${t.text};
        margin: 0; letter-spacing: .02em;
      }
      .ff-subtitle {
        font-size: 11px; font-weight: 400; letter-spacing: .14em;
        text-transform: uppercase; color: ${AURA.gold};
        margin: 8px 0 0;
      }

      .ff-divider {
        display: flex; align-items: center; gap: 10px; margin: 22px 0 0;
      }
      .ff-divider::before, .ff-divider::after {
        content: ''; flex: 1; height: 1px;
      }
      .ff-divider::before { background: linear-gradient(to right, transparent, ${AURA.gold}); }
      .ff-divider::after  { background: linear-gradient(to left, transparent, ${AURA.gold}); }
      .ff-divider-dot { width: 5px; height: 5px; border-radius: 50%; background: ${AURA.gold}; }

      .ff-card {
        background: ${t.bgEl}; border: 1px solid ${t.border};
        border-radius: 20px; overflow: hidden; margin-bottom: 20px;
        backdrop-filter: blur(24px); position: relative;
      }
      .ff-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent);
      }
      .ff-card-pad { padding: 22px 22px 26px; }
      @media(max-width: 480px) { .ff-card-pad { padding: 18px 16px 22px; } }

      .ff-card-head {
        padding: 20px 22px;
        border-bottom: 1px solid ${t.border};
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 12px;
      }
      .ff-card-head-title {
        font-family: 'Playfair Display', serif;
        font-size: 17px; font-weight: 500; color: ${t.text}; margin: 0;
      }
      .ff-card-head-sub {
        font-size: 11px; font-weight: 300; color: ${t.textMuted}; margin: 3px 0 0;
      }

      .ff-section-hd {
        display: flex; align-items: center; gap: 12px; margin-bottom: 22px;
      }
      .ff-section-num {
        width: 30px; height: 30px; min-width: 30px; border-radius: 10px;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.blue});
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-family: 'Playfair Display',serif; font-weight: 600; font-size: 13px;
      }
      .ff-section-title {
        font-size: 11px; font-weight: 600; letter-spacing: .18em;
        text-transform: uppercase; color: ${t.text}; margin: 0;
      }

      .ff-grid-2     { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .ff-grid-2-1   { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
      .ff-grid-saude { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
      .ff-col-span-2 { grid-column: 1 / -1; }

      @media(max-width: 640px) {
        .ff-grid-2, .ff-grid-2-1, .ff-grid-saude { grid-template-columns: 1fr; }
        .ff-col-span-2 { grid-column: 1; }
      }

      .ff-label {
        display: block; margin-bottom: 6px;
        font-size: 9.5px; font-weight: 600; letter-spacing: .18em;
        text-transform: uppercase; color: ${AURA.gold};
      }

      .ff-input, .ff-select {
        width: 100%; box-sizing: border-box;
        background: ${t.bgInput}; border: 1px solid ${t.borderInput};
        color: ${t.text}; padding: 13px 16px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 300;
        transition: all .25s; -webkit-appearance: none; appearance: none;
      }
      .ff-input:focus, .ff-select:focus {
        border-color: rgba(201,169,110,.5);
        background: rgba(201,169,110,.04);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .ff-input::placeholder { color: ${t.placeholder}; }
      .ff-select {
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A96E' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px;
      }
      .ff-select option { background: ${t.optionBg}; color: ${t.text}; }

      .ff-checkbox-card {
        padding: 16px 18px; border-radius: 13px;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.16)"};
        transition: border-color .2s;
      }
      .ff-checkbox-card:hover { border-color: rgba(201,169,110,.3); }
      .ff-checkbox-row {
        display: flex; align-items: center; gap: 12px; cursor: pointer;
        font-size: 10.5px; font-weight: 600; letter-spacing: .12em;
        text-transform: uppercase; color: ${t.text};
      }
      .ff-checkbox-row input[type=checkbox] {
        accent-color: ${AURA.gold}; width: 20px; height: 20px; flex-shrink: 0;
      }

      .ff-bio-input {
        text-align: center; font-weight: 600; font-size: 20px;
        font-family: 'Playfair Display', serif; color: ${AURA.gold};
      }

      .ff-btn-primary {
        width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
        padding: 16px; border: none; border-radius: 100px; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; font-family: 'Inter', sans-serif;
        font-size: 11px; font-weight: 600; letter-spacing: .2em;
        text-transform: uppercase; transition: all .3s;
        box-shadow: 0 6px 20px rgba(200,16,46,.25);
      }
      .ff-btn-primary:hover:not(:disabled) { opacity: .9; transform: translateY(-2px); }
      .ff-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

      .ff-btn-gold {
        display: flex; align-items: center; gap: 7px;
        padding: 11px 20px; border-radius: 100px; border: none; cursor: pointer;
        background: linear-gradient(135deg, ${AURA.gold}, ${AURA.goldLight});
        color: #0A0A0F; font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; transition: all .35s;
        box-shadow: 0 6px 22px rgba(201,169,110,.22); flex-shrink: 0;
      }
      .ff-btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(201,169,110,.32); }
      .ff-btn-gold:disabled { opacity: .5; cursor: not-allowed; }

      .ff-divider-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(201,169,110,.15), transparent);
        margin: 2px 0;
      }

      .ff-fichas-list {
        padding: 16px 20px; display: flex; flex-direction: column; gap: 9px;
      }
      .ff-ficha-row {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        padding: 13px 16px;
        background: ${isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)"};
        border: 1px solid ${isDark ? "rgba(201,169,110,.07)" : "rgba(201,169,110,.12)"};
        border-radius: 13px; transition: border-color .2s;
      }
      .ff-ficha-row:hover { border-color: rgba(201,169,110,.3); }
      .ff-ficha-avatar {
        width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
        background: linear-gradient(135deg, rgba(201,169,110,.2), rgba(201,169,110,.06));
        border: 1px solid rgba(201,169,110,.22);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-weight: 600; font-size: 15px; color: ${AURA.gold};
      }
      .ff-ficha-name {
        font-size: 13px; font-weight: 400; color: ${t.text};
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        margin: 0;
      }
      .ff-ficha-date {
        font-size: 10px; font-weight: 300; color: ${t.textMuted}; margin: 2px 0 0;
      }
      .ff-status-pill {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 5px 13px; border-radius: 100px; flex-shrink: 0;
        background: rgba(201,169,110,.1); border: 1px solid rgba(201,169,110,.28);
        font-size: 9px; font-weight: 600; letter-spacing: .14em;
        text-transform: uppercase; color: ${AURA.gold};
      }

      .ff-footer {
        text-align: center;
        font-size: 9px; font-weight: 500; letter-spacing: .18em;
        text-transform: uppercase;
        color: ${isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)"};
        padding: 16px 0 0;
      }
    `}</style>
  );
}

export default function TelaFichas({ celula = {}, onSuccess, isDark = false }) {
  const t = theme(isDark);

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

  return (
      <div className="ff-root">
        <GlobalStyles t={t} isDark={isDark} />

        {/* ── Cabeçalho ── */}
        <div className="ff-header">
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <div className="dl-pulse" style={{ width: 64, height: 64, position: "absolute", border: "1px solid rgba(201,169,110,.22)", borderRadius: "50%" }} />
            <div className="dl-pulse" style={{ width: 52, height: 52, position: "absolute", border: "1px solid rgba(201,169,110,.18)", borderRadius: "50%", animationDelay: ".9s" }} />
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: isDark ? "rgba(18,18,26,.99)" : "#fff", border: "1.5px solid rgba(201,169,110,.28)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
              <IEQCross size={32} />
            </div>
          </div>
          <p className="ff-eyebrow">Secretaria · Ficha de Inscrição</p>
          <h1 className="ff-title">{form.nomeEncontro}</h1>
          <p className="ff-subtitle">{form.localEncontro}</p>
        </div>

        <div className="ff-divider"><div className="ff-divider-dot" /></div>

        {/* ── Minhas Inscrições ── */}
        <div className="ff-card" style={{ marginTop: 22 }}>
          <div className="ff-card-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={16} style={{ color: AURA.gold, flexShrink: 0 }} />
              <div>
                <h3 className="ff-card-head-title">Minhas Inscrições</h3>
                <p className="ff-card-head-sub">{minhasFichas.length} enviada(s)</p>
              </div>
            </div>
            <button className="ff-btn-gold" onClick={carregarMinhasFichas} disabled={loadingFichas}>
              <RefreshCw size={13} className={loadingFichas ? "dl-spin" : ""} /> Atualizar
            </button>
          </div>

          <div className="ff-fichas-list">
            {loadingFichas ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Loader2 size={24} className="dl-spin" style={{ color: AURA.gold }} />
                </div>
            ) : minhasFichas.length > 0 ? (
                minhasFichas.map((ficha, i) => (
                    <React.Fragment key={ficha.id}>
                      {i > 0 && i % 5 === 0 && <div className="ff-divider-line" />}
                      <div className="ff-ficha-row">
                        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                          <div className="ff-ficha-avatar">{ficha.nome?.charAt(0).toUpperCase()}</div>
                          <div style={{ minWidth: 0 }}>
                            <p className="ff-ficha-name">{ficha.nome}</p>
                            <p className="ff-ficha-date">
                              <Calendar size={9} style={{ display: "inline", marginRight: 4, verticalAlign: "-1px" }} />
                              {new Date(ficha.dataInicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <span className="ff-status-pill">
                          <CheckCircle2 size={11} /> Enviada
                        </span>
                      </div>
                    </React.Fragment>
                ))
            ) : (
                <p style={{ textAlign: "center", padding: "16px 0", fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 300, fontStyle: "italic", color: t.textMuted }}>
                  Nenhuma inscrição enviada ainda.
                </p>
            )}
          </div>
        </div>

        {/* ── Formulário ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Seção 1: Dados Pessoais */}
          <div className="ff-card">
            <div className="ff-card-pad">
              <div className="ff-section-hd">
                <div className="ff-section-num">1</div>
                <h3 className="ff-section-title">Dados Pessoais</h3>
              </div>
              <div className="ff-grid-2">
                <div className="ff-col-span-2">
                  <label className="ff-label">Nome completo *</label>
                  <input className="ff-input" name="nome" value={form.nome} onChange={handleChange} required placeholder="Nome completo" autoComplete="name" />
                </div>
                <div>
                  <label className="ff-label">Data de nascimento *</label>
                  <input className="ff-input" name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} required style={{ colorScheme: isDark ? "dark" : "light" }} />
                </div>
                <div>
                  <label className="ff-label">Sexo</label>
                  <select className="ff-select" name="sexo" value={form.sexo} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="ff-label">Estado civil</label>
                  <select className="ff-select" name="estadoCivil" value={form.estadoCivil} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="SOLTEIRO">Solteiro</option>
                    <option value="CASADO">Casado</option>
                    <option value="DIVORCIADO">Divorciado</option>
                    <option value="VIÚVO">Viúvo</option>
                  </select>
                </div>
                <div>
                  <label className="ff-label">Telefone / WhatsApp *</label>
                  <input className="ff-input" name="telefone" value={form.telefone} onChange={handleChange} required placeholder="(00) 00000-0000" type="tel" inputMode="tel" autoComplete="tel" />
                </div>
                <div>
                  <label className="ff-label">RG</label>
                  <input className="ff-input" name="rg" value={form.rg} onChange={handleChange} inputMode="numeric" />
                </div>
                <div>
                  <label className="ff-label">Estado (UF)</label>
                  <input className="ff-input" name="estado" value={form.estado} onChange={handleChange} maxLength={2} placeholder="BA" style={{ textTransform: "uppercase" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Localização */}
          <div className="ff-card">
            <div className="ff-card-pad">
              <div className="ff-section-hd">
                <div className="ff-section-num" style={{ background: `linear-gradient(135deg,${AURA.blueDark},${AURA.blue})` }}>
                  <MapPin size={13} />
                </div>
                <h3 className="ff-section-title">Localização</h3>
              </div>
              <div className="ff-grid-2-1">
                <div className="ff-col-span-2">
                  <label className="ff-label">Endereço (rua, nº)</label>
                  <input className="ff-input" name="endereco" value={form.endereco} onChange={handleChange} autoComplete="street-address" />
                </div>
                <div>
                  <label className="ff-label">Bairro</label>
                  <input className="ff-input" name="bairro" value={form.bairro} onChange={handleChange} />
                </div>
                <div>
                  <label className="ff-label">Cidade</label>
                  <input className="ff-input" name="cidade" value={form.cidade} onChange={handleChange} autoComplete="address-level2" />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Saúde e Biometria */}
          <div className="ff-card">
            <div className="ff-card-pad">
              <div className="ff-section-hd">
                <div className="ff-section-num">
                  <Heart size={13} />
                </div>
                <h3 className="ff-section-title">Saúde e Biometria</h3>
              </div>

              <div className="ff-grid-saude">
                <div className="ff-checkbox-card">
                  <label className="ff-checkbox-row">
                    <input type="checkbox" name="tomaMedicamento" checked={form.tomaMedicamento} onChange={handleChange} />
                    Toma algum medicamento?
                  </label>
                  {form.tomaMedicamento && (
                      <input className="ff-input" name="qualMedicamento" value={form.qualMedicamento} onChange={handleChange} placeholder="Quais medicamentos?" style={{ marginTop: 12 }} />
                  )}
                </div>
                <div className="ff-checkbox-card">
                  <label className="ff-checkbox-row">
                    <input type="checkbox" name="temProblemasSaude" checked={form.temProblemasSaude} onChange={handleChange} />
                    Problemas de saúde?
                  </label>
                  {form.temProblemasSaude && (
                      <input className="ff-input" name="qualProblemaSaude" value={form.qualProblemaSaude} onChange={handleChange} placeholder="Quais problemas?" style={{ marginTop: 12 }} />
                  )}
                </div>
              </div>

              <div className="ff-grid-2" style={{ marginTop: 18 }}>
                <div>
                  <label className="ff-label" style={{ textAlign: "center", display: "block" }}>Peso (kg)</label>
                  <input className="ff-input ff-bio-input" name="peso" type="number" step="0.1" inputMode="decimal" value={form.peso} onChange={handleChange} placeholder="00.0" />
                </div>
                <div>
                  <label className="ff-label" style={{ textAlign: "center", display: "block" }}>Altura (m)</label>
                  <input className="ff-input ff-bio-input" name="altura" type="number" step="0.01" inputMode="decimal" value={form.altura} onChange={handleChange} placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 4: Vida Espiritual */}
          <div className="ff-card">
            <div className="ff-card-pad">
              <div className="ff-section-hd">
                <div className="ff-section-num" style={{ background: `linear-gradient(135deg,${AURA.blueDark},${AURA.blue})` }}>
                  <Sparkles size={13} />
                </div>
                <h3 className="ff-section-title">Vida Espiritual</h3>
              </div>
              <div className="ff-grid-2">
                {[
                  { name: "aceitouJesus", label: "Já aceitou Jesus?" },
                  { name: "jaEraCristao", label: "Já era cristão?" },
                ].map(({ name, label }) => (
                    <div key={name} className="ff-checkbox-card" style={{
                      background: isDark ? "rgba(0,61,165,.08)" : "rgba(0,61,165,.05)",
                      borderColor: isDark ? "rgba(0,61,165,.2)" : "rgba(0,61,165,.15)",
                    }}>
                      <label className="ff-checkbox-row" style={{ color: isDark ? "#7090e8" : AURA.blue }}>
                        <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} style={{ accentColor: AURA.blue }} />
                        {label}
                      </label>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botão enviar */}
          <button className="ff-btn-primary" onClick={handleSubmit} disabled={enviando}>
            {enviando ? <><Loader2 size={18} className="dl-spin" /> Enviando...</> : <><User size={15} /> Concluir Inscrição</>}
          </button>

          <p className="ff-footer">© IEQ Pituaçu · Sistema Seguro · {new Date().getFullYear()}</p>
        </div>
      </div>
  );
}
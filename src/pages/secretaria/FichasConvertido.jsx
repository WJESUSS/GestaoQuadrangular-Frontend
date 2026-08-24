import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, User, Mail, Phone, MapPin, Calendar,
  FileText, RefreshCw, AlertCircle, Heart, BookOpen, XCircle,
  Search, Droplets, ChevronLeft, ChevronRight,
} from "lucide-react";

const AURA = {
  gold:      "#C9A96E",
  dark:      "#0A0A0F",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  green:     "#059669",
};

function theme(isDark) {
  return {
    bgEl:        isDark ? "rgba(18,18,26,.95)"     : "rgba(255,255,255,.95)",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
    text:        isDark ? "#F5F0E8"                : "#1A1008",
    textSec:     isDark ? "#9A9588"                : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"                : "#9A9080",
    optionBg:    isDark ? "#12121A"                : "#F0EAE0",
  };
}

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const ESTADO_CIVIL = ["SOLTEIRO","CASADO","DIVORCIADO","VIUVO","SEPARADO","UNIAO_ESTAVEL"];
const TIPO_ARROLAMENTO = ["PROFISSAO_DE_FE","TRANSFERENCIA"];
const GRAU_ESCOLARIDADE = [
  "EDUCACAO_INFANTIL","ENSINO_FUNDAMENTAL_I","ENSINO_FUNDAMENTAL_II","ENSINO_MEDIO",
  "ENSINO_MEDIO_INCOMPLETO","TECNICO","SUPERIOR_INCOMPLETO","SUPERIOR_COMPLETO",
  "POS_GRADUACAO","MESTRADO","DOUTORADO",
];

/* ─── Componentes de formulário ─────────────────────────────────────── */

function Input({ label, icon, name, value, onChange, t, ...rest }) {
  return (
      <div>
        <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: t.textMuted, marginBottom: 5 }}>{label}</label>
        <div style={{ position: "relative" }}>
          {icon && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }}>{icon}</span>}
          <input
              {...rest}
              name={name}
              value={value || ""}
              onChange={onChange}
              style={{
                width: "100%", background: t.bgInput, border: `1px solid ${t.borderInput}`,
                color: t.text, padding: `11px 14px 11px ${icon ? 38 : 14}px`,
                borderRadius: 10, outline: "none", fontFamily: "inherit", fontSize: 14,
                transition: "all .2s", boxSizing: "border-box",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,110,.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = t.borderInput; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
      </div>
  );
}

function Select({ label, icon, value, onChange, t, children }) {
  return (
      <div>
        <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: t.textMuted, marginBottom: 5 }}>{label}</label>
        <div style={{ position: "relative" }}>
          {icon && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }}>{icon}</span>}
          <select
              value={value}
              onChange={onChange}
              style={{
                width: "100%", background: t.bgInput, border: `1px solid ${t.borderInput}`,
                color: t.text, padding: `11px 14px 11px ${icon ? 38 : 14}px`,
                borderRadius: 10, outline: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                appearance: "none", cursor: "pointer", transition: "all .2s", boxSizing: "border-box",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,110,.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = t.borderInput; e.currentTarget.style.boxShadow = "none"; }}
          >
            <option value="" style={{ background: t.optionBg }}>Selecione...</option>
            {children}
          </select>
        </div>
      </div>
  );
}

function Checkbox({ label, checked, onChange, t }) {
  return (
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: t.text, padding: "4px 0" }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 16, height: 16, accentColor: AURA.gold }} />
        {label}
      </label>
  );
}

function Section({ title, icon, children, t }) {
  return (
      <div style={{ background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 16, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(201,169,110,.1)", color: AURA.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{title}</span>
        </div>
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          {children}
        </div>
      </div>
  );
}

const FORM_INICIAL = {
  nome: "", telefone: "", email: "", cpf: "", rg: "",
  estadoCivil: "", dataNascimento: "", dataConversao: "",
  nomeMae: "", nomePai: "", nomeConjuge: "", naturalidade: "",
  grauEscolaridade: "", curso: "", profissao: "",
  endereco: "", numero: "", bairro: "", cidade: "", cep: "", uf: "",
  pertenceOutraReligiao: false, qualReligiao: "",
  batizadoNasAguas: false, dataBatizadoNasAguas: "", igrejaBatizadoNasAguas: "",
  batizadoEspiritoSanto: false,
  tipoArrolamento: "", jurisdicaoArrolamento: "", arroladoPor: "",
  observacoes: "",
};

export default function FichasConvertido({ isDark }) {
  const t = theme(isDark);
  const [form, setForm] = useState(FORM_INICIAL);
  const [sending, setSending] = useState(false);
  const [convertidos, setConvertidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Autorização de membresia (batismo na igreja)
  const [autorizando, setAutorizando] = useState(null);
  const [dataBatismoIgreja, setDataBatismoIgreja] = useState("");
  const [actionId, setActionId] = useState(null);

  const ok = msg => { setSucesso(msg); setTimeout(() => setSucesso(""), 3500); };

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/convertidos", { params: { page, size: 10 } });
      setConvertidos(r.data?.content || []);
      setTotalPages(r.data?.totalPages || 0);
    } catch { setErro("Erro ao carregar convertidos."); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { carregar(); }, [carregar]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const enviar = async e => {
    e.preventDefault(); setSending(true); setErro("");

    const camposEnum = new Set(["estadoCivil", "tipoArrolamento"]);
    const camposDate = new Set(["dataNascimento", "dataConversao", "dataBatizadoNasAguas"]);
    const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => {
          if (camposEnum.has(k) || camposDate.has(k)) return [k, v === "" ? null : v];
          if (k === "uf" && v === "") return [k, null];
          return [k, v];
        })
    );

    try {
      await api.post("/convertidos", payload);
      setForm(FORM_INICIAL);
      window.dispatchEvent(new Event("convertidos:updated"));
      ok("Ficha de convertido registrada! Ele(a) se tornará membro após o batismo.");
      carregar();
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao registrar ficha.");
    } finally { setSending(false); }
  };

  const abrirAutorizacao = c => {
    setAutorizando(c);
    setDataBatismoIgreja("");
  };

  const autorizarMembresia = async () => {
    if (!dataBatismoIgreja) { setErro("Informe a data do batismo nesta igreja."); return; }
    setActionId(autorizando.id);
    try {
      await api.patch(`/convertidos/${autorizando.id}/autorizar-membresia`, { dataBatismo: dataBatismoIgreja });
      ok(`${autorizando.nome} agora é membro da igreja!`);
      window.dispatchEvent(new Event("convertidos:updated"));
      setAutorizando(null);
      setDataBatismoIgreja("");
      carregar();
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao autorizar membresia.");
    } finally { setActionId(null); }
  };

  const statusBadge = s => {
    const map = {
      AGUARDANDO_BATISMO: { color: "#D97706", bg: "rgba(217,119,6,.1)", label: "Aguardando Batismo" },
      MEMBRO:             { color: "#059669", bg: "rgba(5,150,105,.1)", label: "Membro" },
    };
    const c = map[s] || map.AGUARDANDO_BATISMO;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: ".07em", color: c.color, background: c.bg, border: `1px solid ${c.color}30`, whiteSpace: "nowrap" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} /> {c.label}
      </span>
    );
  };

  const filtrados = busca
      ? convertidos.filter(c => c.nome?.toLowerCase().includes(busca.toLowerCase()))
      : convertidos;

  return (
      <div style={{ fontFamily: "'Inter',sans-serif", color: t.text, maxWidth: 800, margin: "0 auto", padding: "0 0 40px" }}>
        <style>{`@keyframes dl-spin { to { transform: rotate(360deg); } }`}</style>

        <AnimatePresence>
          {sucesso && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, background: "rgba(5,150,105,.08)", border: "1px solid rgba(5,150,105,.2)", color: "#059669", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
                <CheckCircle2 size={15} /> {sucesso}
              </motion.div>
          )}
          {erro && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", color: "#DC2626", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
                <AlertCircle size={15} /> {erro}
              </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Autorização de Membresia */}
        <AnimatePresence>
          {autorizando && (
              <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
                  onClick={e => e.target === e.currentTarget && setAutorizando(null)}
              >
                <motion.div
                    initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    style={{ width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", background: t.bgEl, border: `1px solid ${t.border}`, padding: 22 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(5,150,105,.1)", color: AURA.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Droplets size={17} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: t.text }}>Tornar Membro</h3>
                      <p style={{ fontSize: 11, color: t.textMuted, margin: "2px 0 0" }}>{autorizando.nome}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: t.textSec, lineHeight: 1.5, margin: "0 0 14px" }}>
                    Ao confirmar, a ficha será convertida em membro efetivo da igreja. Informe a data do batismo realizado nesta igreja:
                  </p>

                  <Input label="Data do Batismo *" name="dataBatismoIgreja" type="date" value={dataBatismoIgreja} onChange={e => setDataBatismoIgreja(e.target.value)} icon={<Calendar size={14} />} t={t} />

                  <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                    <button onClick={() => setAutorizando(null)} disabled={actionId === autorizando.id}
                            style={{ flex: 1, padding: "12px", borderRadius: 100, border: `1px solid ${t.border}`, background: "transparent", color: t.textSec, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase" }}>
                      Cancelar
                    </button>
                    <button onClick={autorizarMembresia} disabled={actionId === autorizando.id}
                            style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", border: "none", borderRadius: 100, cursor: "pointer", background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", opacity: actionId === autorizando.id ? .6 : 1 }}>
                      {actionId === autorizando.id ? <><Loader2 size={13} style={{ animation: "dl-spin 1s linear infinite" }} /> Convertendo...</> : <><CheckCircle2 size={13} /> Confirmar Membresia</>}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "8px 0 22px" }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".25em", textTransform: "uppercase", color: "rgba(201,169,110,.6)", marginBottom: 6 }}>Secretaria</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,5vw,26px)", fontWeight: 500, color: t.text, margin: 0 }}>
            Ficha de Convertido
          </h2>
          <p style={{ fontSize: 11, fontWeight: 400, letterSpacing: ".14em", textTransform: "uppercase", color: AURA.gold, marginTop: 6 }}>
            Aceitou Jesus — membro após o batismo
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={enviar}>

          <Section title="Dados Pessoais" icon={<User size={15} />} t={t}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Input label="Nome completo *" name="nome" value={form.nome} onChange={e => set("nome", e.target.value)} icon={<User size={14} />} required t={t} />
              <Input label="Telefone" name="telefone" value={form.telefone} onChange={e => set("telefone", e.target.value)} icon={<Phone size={14} />} t={t} />
              <Input label="E-mail" name="email" value={form.email} onChange={e => set("email", e.target.value)} type="email" icon={<Mail size={14} />} t={t} />
              <Input label="CPF" name="cpf" value={form.cpf} onChange={e => set("cpf", e.target.value)} t={t} />
              <Input label="RG" name="rg" value={form.rg} onChange={e => set("rg", e.target.value)} t={t} />
              <Select label="Estado Civil" value={form.estadoCivil} onChange={e => set("estadoCivil", e.target.value)} t={t}>
                {ESTADO_CIVIL.map(opt => <option key={opt} value={opt} style={{ background: t.optionBg }}>{opt.replace(/_/g, " ")}</option>)}
              </Select>
              <Input label="Data de Nascimento" name="dataNascimento" value={form.dataNascimento} onChange={e => set("dataNascimento", e.target.value)} type="date" icon={<Calendar size={14} />} t={t} />
              <Input label="Data de Conversão *" name="dataConversao" value={form.dataConversao} onChange={e => set("dataConversao", e.target.value)} type="date" required t={t} />
            </div>
          </Section>

          <Section title="Filiação e Naturalidade" icon={<Heart size={15} />} t={t}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Input label="Nome da Mãe" name="nomeMae" value={form.nomeMae} onChange={e => set("nomeMae", e.target.value)} t={t} />
              <Input label="Nome do Pai" name="nomePai" value={form.nomePai} onChange={e => set("nomePai", e.target.value)} t={t} />
              <Input label="Nome do Cônjuge" name="nomeConjuge" value={form.nomeConjuge} onChange={e => set("nomeConjuge", e.target.value)} t={t} />
              <Input label="Naturalidade" name="naturalidade" value={form.naturalidade} onChange={e => set("naturalidade", e.target.value)} t={t} />
            </div>
          </Section>

          <Section title="Escolaridade e Profissão" icon={<BookOpen size={15} />} t={t}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Select label="Grau de Escolaridade" value={form.grauEscolaridade} onChange={e => set("grauEscolaridade", e.target.value)} t={t}>
                {GRAU_ESCOLARIDADE.map(opt => <option key={opt} value={opt} style={{ background: t.optionBg }}>{opt.replace(/_/g, " ")}</option>)}
              </Select>
              <Input label="Curso" name="curso" value={form.curso} onChange={e => set("curso", e.target.value)} t={t} />
              <Input label="Profissão" name="profissao" value={form.profissao} onChange={e => set("profissao", e.target.value)} t={t} />
            </div>
          </Section>

          <Section title="Endereço" icon={<MapPin size={15} />} t={t}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <Input label="Logradouro" name="endereco" value={form.endereco} onChange={e => set("endereco", e.target.value)} t={t} />
              <Input label="Número" name="numero" value={form.numero} onChange={e => set("numero", e.target.value)} t={t} />
              <Input label="Bairro" name="bairro" value={form.bairro} onChange={e => set("bairro", e.target.value)} t={t} />
              <Input label="Cidade" name="cidade" value={form.cidade} onChange={e => set("cidade", e.target.value)} t={t} />
              <Input label="CEP" name="cep" value={form.cep} onChange={e => set("cep", e.target.value)} t={t} />
              <Select label="UF" value={form.uf} onChange={e => set("uf", e.target.value)} t={t}>
                {ESTADOS.map(opt => <option key={opt} value={opt} style={{ background: t.optionBg }}>{opt}</option>)}
              </Select>
            </div>
          </Section>

          <Section title="Dados Espirituais" icon={<FileText size={15} />} t={t}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Checkbox label="Pertence a outra religião?" checked={form.pertenceOutraReligiao} onChange={e => set("pertenceOutraReligiao", e.target.checked)} t={t} />
              {form.pertenceOutraReligiao && <Input label="Qual religião?" name="qualReligiao" value={form.qualReligiao} onChange={e => set("qualReligiao", e.target.value)} t={t} />}
              <Checkbox label="Batizado nas águas anteriormente (outra igreja)?" checked={form.batizadoNasAguas} onChange={e => set("batizadoNasAguas", e.target.checked)} t={t} />
              {form.batizadoNasAguas && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                    <Input label="Data do Batismo" name="dataBatizadoNasAguas" value={form.dataBatizadoNasAguas} onChange={e => set("dataBatizadoNasAguas", e.target.value)} type="date" t={t} />
                    <Input label="Igreja do Batismo" name="igrejaBatizadoNasAguas" value={form.igrejaBatizadoNasAguas} onChange={e => set("igrejaBatizadoNasAguas", e.target.value)} t={t} />
                  </div>
              )}
              <Checkbox label="Batizado no Espírito Santo?" checked={form.batizadoEspiritoSanto} onChange={e => set("batizadoEspiritoSanto", e.target.checked)} t={t} />
            </div>
          </Section>

          <Section title="Arrolamento" icon={<FileText size={15} />} t={t}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Select label="Tipo de Arrolamento" value={form.tipoArrolamento} onChange={e => set("tipoArrolamento", e.target.value)} t={t}>
                {TIPO_ARROLAMENTO.map(opt => <option key={opt} value={opt} style={{ background: t.optionBg }}>{opt.replace(/_/g, " ")}</option>)}
              </Select>
              <Input label="Jurisdição" name="jurisdicaoArrolamento" value={form.jurisdicaoArrolamento} onChange={e => set("jurisdicaoArrolamento", e.target.value)} t={t} />
              <Input label="Arrolado por" name="arroladoPor" value={form.arroladoPor} onChange={e => set("arroladoPor", e.target.value)} t={t} />
            </div>
          </Section>

          <Section title="Observações" icon={<FileText size={15} />} t={t}>
          <textarea
              value={form.observacoes}
              onChange={e => set("observacoes", e.target.value)}
              rows={3}
              placeholder="Ex.: quem conduziu à Cristo, culto em que aceitou Jesus..."
              style={{ width: "100%", background: t.bgInput, border: `1px solid ${t.borderInput}`, color: t.text, padding: 12, borderRadius: 10, outline: "none", fontFamily: "inherit", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
              onFocus={e => { e.currentTarget.style.borderColor = AURA.gold; }}
              onBlur={e => { e.currentTarget.style.borderColor = t.borderInput; }}
          />
          </Section>

          <button type="submit" disabled={sending} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px", border: "none", borderRadius: 100, cursor: sending ? "not-allowed" : "pointer",
            background: `linear-gradient(135deg,${AURA.redDark},${AURA.red})`, color: "#fff",
            fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: ".14em",
            textTransform: "uppercase", opacity: sending ? .6 : 1, transition: "all .25s",
          }}>
            {sending ? <><Loader2 size={15} style={{ animation: "dl-spin 1s linear infinite" }} /> Registrando...</> : "Registrar Convertido"}
          </button>
        </form>

        {/* Lista */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>Convertidos</h3>
            <button onClick={carregar} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 100, border: `1px solid ${t.border}`, background: "transparent", color: t.textSec, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>
              <RefreshCw size={12} style={{ animation: loading ? "dl-spin 1s linear infinite" : "none" }} /> Atualizar
            </button>
          </div>

          <div style={{ position: "relative", marginBottom: 14 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }} />
            <input
                placeholder="Buscar por nome..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                style={{ width: "100%", background: t.bgInput, border: `1px solid ${t.borderInput}`, color: t.text, padding: "12px 16px 12px 44px", borderRadius: 12, outline: "none", fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,110,.12)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = t.borderInput; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {loading ? (
              <div style={{ textAlign: "center", padding: 32 }}><Loader2 size={24} style={{ animation: "dl-spin 1s linear infinite", color: AURA.gold }} /></div>
          ) : filtrados.length === 0 ? (
              <p style={{ textAlign: "center", fontSize: 13, color: t.textMuted, fontStyle: "italic", padding: 24 }}>Nenhum convertido registrado.</p>
          ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(() => {
                  let pendenteCount = 0;
                  return filtrados.map((c, i) => {
                    const isPendente = c.status === "AGUARDANDO_BATISMO";
                    if (isPendente) pendenteCount += 1;
                    const numeroPendente = pendenteCount;
                    return (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * .03 }}
                            style={{
                              background: t.bgEl, border: `1px solid ${isPendente ? "rgba(217,119,6,.25)" : t.border}`,
                              borderRadius: 14, padding: "12px 16px",
                              borderLeft: isPendente ? "3px solid #D97706" : "3px solid #059669",
                              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
                            }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: isPendente ? "rgba(217,119,6,.12)" : "rgba(201,169,110,.1)",
                              color: isPendente ? "#D97706" : AURA.gold,
                              fontSize: 14, fontWeight: 700,
                            }}>
                              {isPendente ? numeroPendente : <User size={15} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nome}</p>
                              <p style={{ fontSize: 10, color: t.textMuted, margin: "2px 0 0" }}>
                                Conversão: {c.dataConversao ? new Date(c.dataConversao).toLocaleDateString("pt-BR") : "—"}
                                {c.telefone ? ` · ${c.telefone}` : ""}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            {statusBadge(c.status)}
                            {isPendente && (
                                <button onClick={() => abrirAutorizacao(c)} disabled={!!actionId}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 100, border: "none", cursor: "pointer", background: "rgba(5,150,105,.1)", color: "#059669", fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
                                  <Droplets size={12} /> Tornar Membro
                                </button>
                            )}
                          </div>
                        </motion.div>
                    );
                  });
                })()}
              </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 20 }}>
                <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 100, border: `1px solid ${t.border}`, background: "transparent", color: page === 0 ? t.textMuted : t.text, cursor: page === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", opacity: page === 0 ? .4 : 1 }}>
                  <ChevronLeft size={13} /> Anterior
                </button>
                <span style={{ fontSize: 12, color: t.textMuted }}>{page + 1} / {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 100, border: `1px solid ${t.border}`, background: "transparent", color: page >= totalPages - 1 ? t.textMuted : t.text, cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", opacity: page >= totalPages - 1 ? .4 : 1 }}>
                  Próximo <ChevronRight size={13} />
                </button>
              </div>
          )}
        </div>
      </div>
  );
}
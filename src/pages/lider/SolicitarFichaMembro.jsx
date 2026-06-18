import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, User, Mail, Phone, MapPin, Calendar,
  FileText, RefreshCw, AlertCircle, Heart, BookOpen,
} from "lucide-react";

const AURA = {
  gold:    "#C9A96E",
  red:     "#C8102E",
  redDark: "#9B0B1E",
};

function theme(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"              : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.95)"    : "rgba(255,255,255,.95)",
    bgInput:     isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"  : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.15)" : "rgba(201,169,110,.28)",
    text:        isDark ? "#F5F0E8"               : "#1A1008",
    textSec:     isDark ? "#9A9588"               : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"               : "#9A9080",
    optionBg:    isDark ? "#12121A"               : "#F0EAE0",
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

// ✅ Componentes definidos FORA do componente pai para evitar remount a cada render

const Input = ({ label, icon, name, value, onChange, t, ...rest }) => (
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
            onFocus={e => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(201,169,110,.12)`; }}
            onBlur={e => { e.currentTarget.style.borderColor = t.borderInput; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>
    </div>
);

const Select = ({ label, icon, value, onChange, t, children }) => (
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
            onFocus={e => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(201,169,110,.12)`; }}
            onBlur={e => { e.currentTarget.style.borderColor = t.borderInput; e.currentTarget.style.boxShadow = "none"; }}
        >
          <option value="" style={{ background: t.optionBg }}>Selecione...</option>
          {children}
        </select>
      </div>
    </div>
);

const Checkbox = ({ label, checked, onChange, t }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: t.text, padding: "4px 0" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 16, height: 16, accentColor: AURA.gold }} />
      {label}
    </label>
);

const Section = ({ title, icon, children, t }) => (
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

const FORM_INICIAL = {
  nome: "", telefone: "", email: "", cpf: "", rg: "",
  estadoCivil: "", dataNascimento: "", dataConversao: "", dataBatismo: "",
  nomeMae: "", nomePai: "", nomeConjuge: "", naturalidade: "",
  grauEscolaridade: "", curso: "", profissao: "",
  endereco: "", numero: "", bairro: "", cidade: "", cep: "", uf: "",
  pertenceOutraReligiao: false, qualReligiao: "",
  batizadoNasAguas: false, dataBatizadoNasAguas: "", igrejaBatizadoNasAguas: "",
  batizadoEspiritoSanto: false,
  tipoArrolamento: "", jurisdicaoArrolamento: "", arroladoPor: "",
  observacoes: "",
};

export default function SolicitarFichaMembro({ isDark }) {
  const t = theme(isDark);
  const [form, setForm] = useState(FORM_INICIAL);
  const [sending, setSending] = useState(false);
  const [minhas, setMinhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const ok = msg => { setSucesso(msg); setTimeout(() => setSucesso(""), 3500); };

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return null;
    const hoje = new Date();
    const nasc = new Date(dataNasc + "T00:00:00");
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  const idade = calcularIdade(form.dataNascimento);

  const erroMenor12 = idade !== null && idade < 12 && !form.batizadoNasAguas;

  const erroNaoBatizado =
      idade !== null && idade >= 12 && !form.batizadoNasAguas && form.tipoArrolamento !== "TRANSFERENCIA";

  const erroEnvio = erroMenor12 || erroNaoBatizado;

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/solicitacoes-ficha/minhas");
      setMinhas(Array.isArray(r.data) ? r.data : []);
    } catch { setErro("Erro ao carregar solicitações."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const enviar = async e => {
    e.preventDefault(); setSending(true); setErro("");

    const camposEnum = new Set(["estadoCivil", "tipoArrolamento"]);
    const camposDate = new Set(["dataNascimento", "dataConversao", "dataBatismo", "dataBatizadoNasAguas"]);
    const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => {
          if (camposEnum.has(k) || camposDate.has(k)) return [k, v === "" ? null : v];
          if (k === "uf" && v === "") return [k, null];
          return [k, v];
        })
    );

    try {
      await api.post("/solicitacoes-ficha", payload);
      setForm(FORM_INICIAL);
      ok("Solicitação enviada! Aguarde a aprovação da secretaria.");
      carregar();
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao enviar solicitação.");
    } finally { setSending(false); }
  };

  const statusBadge = (s) => {
    const map = {
      PENDENTE:  { color: "#D97706", bg: "rgba(217,119,6,.1)",   label: "Pendente" },
      APROVADO:  { color: "#059669", bg: "rgba(5,150,105,.1)",   label: "Aprovado" },
      REJEITADO: { color: "#DC2626", bg: "rgba(220,38,38,.1)",   label: "Rejeitado" },
    };
    const c = map[s?.status] || map.PENDENTE;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: ".07em", color: c.color, background: c.bg, border: `1px solid ${c.color}30`, whiteSpace: "nowrap" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
          {c.label}
      </span>
    );
  };

  return (
      <div style={{ fontFamily: "'Inter',sans-serif", color: t.text, maxWidth: 800, margin: "0 auto", padding: "0 0 40px" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600&family=Inter:wght@300;400;500;600&display=swap'); @keyframes dl-spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ textAlign: "center", padding: "8px 0 22px" }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".25em", textTransform: "uppercase", color: "rgba(201,169,110,.6)", marginBottom: 6 }}>Líder</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,5vw,26px)", fontWeight: 500, color: t.text, margin: 0 }}>
            Solicitar Ficha de Membro
          </h2>
          <p style={{ fontSize: 11, fontWeight: 400, letterSpacing: ".14em", textTransform: "uppercase", color: AURA.gold, marginTop: 6 }}>
            Cadastro de novo membro
          </p>
        </div>

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

        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

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
              <Input label="Data de Conversão" name="dataConversao" value={form.dataConversao} onChange={e => set("dataConversao", e.target.value)} type="date" t={t} />
              <Input label="Data de Batismo" name="dataBatismo" value={form.dataBatismo} onChange={e => set("dataBatismo", e.target.value)} type="date" t={t} />
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
              <Checkbox label="Batizado nas águas?" checked={form.batizadoNasAguas} onChange={e => set("batizadoNasAguas", e.target.checked)} t={t} />
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
              style={{ width: "100%", background: t.bgInput, border: `1px solid ${t.borderInput}`, color: t.text, padding: 12, borderRadius: 10, outline: "none", fontFamily: "inherit", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
              onFocus={e => { e.currentTarget.style.borderColor = AURA.gold; }}
              onBlur={e => { e.currentTarget.style.borderColor = t.borderInput; }}
          />
          </Section>

          {erroMenor12 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", color: "#DC2626", fontSize: 11, fontWeight: 600, marginBottom: 12 }}>
              <AlertCircle size={14} /> Não é permitido cadastrar menor de 12 anos que não é batizado nas águas.
            </div>
          )}
          {erroNaoBatizado && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", color: "#DC2626", fontSize: 11, fontWeight: 600, marginBottom: 12 }}>
              <AlertCircle size={14} /> Não é permitido cadastrar membro sem batismo nas águas ou transferência.
            </div>
          )}

          <button type="submit" disabled={sending || erroEnvio} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px", border: "none", borderRadius: 100, cursor: (sending || erroEnvio) ? "not-allowed" : "pointer",
            background: `linear-gradient(135deg,${AURA.redDark},${AURA.red})`, color: "#fff",
            fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: ".14em",
            textTransform: "uppercase", opacity: (sending || erroEnvio) ? .6 : 1, transition: "all .25s",
          }}>
            {sending ? <><Loader2 size={15} style={{ animation: "dl-spin 1s linear infinite" }} /> Enviando...</> : "Enviar Solicitação"}
          </button>
        </form>

        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>Minhas Solicitações</h3>
            <button onClick={carregar} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 100, border: `1px solid ${t.border}`, background: "transparent", color: t.textSec, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>
              <RefreshCw size={12} style={{ animation: loading ? "dl-spin 1s linear infinite" : "none" }} /> Atualizar
            </button>
          </div>

          {loading ? (
              <div style={{ textAlign: "center", padding: 32 }}><Loader2 size={24} style={{ animation: "dl-spin 1s linear infinite", color: AURA.gold }} /></div>
          ) : minhas.length === 0 ? (
              <p style={{ textAlign: "center", fontSize: 13, color: t.textMuted, fontStyle: "italic", padding: 24 }}>Nenhuma solicitação encontrada.</p>
          ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {minhas.map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "12px 16px", background: t.bgEl, border: `1px solid ${t.border}`, borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,169,110,.1)", color: AURA.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={14} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.nome}</p>
                          <p style={{ fontSize: 10, color: t.textMuted, margin: "2px 0 0" }}>
                            {new Date(s.dataSolicitacao).toLocaleDateString("pt-BR")} {s.celulaDescricao ? `· ${s.celulaDescricao}` : ""}
                          </p>
                          {s.status === "REJEITADO" && s.motivoRejeicao && (
                            <p style={{ fontSize: 11, color: "#DC2626", margin: "4px 0 0", lineHeight: 1.4 }}>
                              Motivo: {s.motivoRejeicao}
                            </p>
                          )}
                        </div>
                      </div>
                      {statusBadge(s)}
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}
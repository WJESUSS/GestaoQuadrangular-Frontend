import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api.js";
import {
  Calendar, BookOpen, Loader2, ChevronDown,
  UserCheck, ClipboardCheck, Trophy, Users2, CheckCircle2,
  Edit3, ArrowLeft, AlertTriangle, History,
} from "lucide-react";

/* ─── Cores Oficiais IEQ ─── */
const IEQ = {
  red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
  yellow: "#FDB813", yellowDark: "#C48C00",
  blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
  white: "#FFFFFF", offWhite: "#F5F0E8",
  dark: "#0A0608", darkCard: "#110A0D",
};

const draftKey = (celulaId) => `ieq_relatorio_draft_${celulaId}`;

/* ─── Dados completos da Bíblia (66 livros) ─── */
const BIBLIA = [
  { nome: "Gênesis",           cap: 50,  vers: [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26] },
  { nome: "Êxodo",             cap: 40,  vers: [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38] },
  { nome: "Levítico",          cap: 27,  vers: [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,24,46,22,22,15,64,44,21,29] },
  { nome: "Números",           cap: 36,  vers: [54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13] },
  { nome: "Deuteronômio",      cap: 34,  vers: [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12] },
  { nome: "Josué",             cap: 24,  vers: [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33] },
  { nome: "Juízes",            cap: 21,  vers: [36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25] },
  { nome: "Rute",              cap: 4,   vers: [22,23,18,22] },
  { nome: "1 Samuel",          cap: 31,  vers: [28,36,21,22,12,21,17,22,27,27,15,25,14,23,29,23,25,18,22,19,19,25,22,31,26,16,23,30,28,11,13] },
  { nome: "2 Samuel",          cap: 24,  vers: [27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25] },
  { nome: "1 Reis",            cap: 22,  vers: [53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53] },
  { nome: "2 Reis",            cap: 25,  vers: [18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30] },
  { nome: "1 Crônicas",        cap: 29,  vers: [54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30] },
  { nome: "2 Crônicas",        cap: 36,  vers: [17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23] },
  { nome: "Esdras",            cap: 10,  vers: [11,70,13,24,17,22,28,36,15,44] },
  { nome: "Neemias",           cap: 13,  vers: [11,20,32,23,19,19,73,18,38,39,36,47,31] },
  { nome: "Ester",             cap: 10,  vers: [22,23,15,17,14,14,10,17,32,3] },
  { nome: "Jó",                cap: 42,  vers: [22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17] },
  { nome: "Salmos",            cap: 150, vers: [6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,20,28,22,35,22,46,28,35,34,46,46,39,51,46,75,66,20,45,28,69,75,10,21,19,31,46,58,32,18,36,76,22,17,32,24,46,37,22,17,19,26,13,25,11,22,24,30,30,21,30,28,26,28,16,34,51,6,27,11,30,30,21,30,21,29,30,20,29,29,55,24,14,47,47,9,15,37,13,19,16,28,22,17,21,22,27,27,9,20,23,38,22,7,23,28,23,24,9,21,13,24,20,21,20,15,21,21,8,17,14,21,21,18,21,18,21,21,29,31,19,28,39,19,21,25,23,29,25,29,25,21,28,21,25,24,21,27] },
  { nome: "Provérbios",        cap: 31,  vers: [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31] },
  { nome: "Eclesiastes",       cap: 12,  vers: [18,26,22,16,20,12,29,17,18,20,10,14] },
  { nome: "Cânticos",          cap: 8,   vers: [17,17,11,16,16,13,13,14] },
  { nome: "Isaías",            cap: 66,  vers: [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24] },
  { nome: "Jeremias",          cap: 52,  vers: [19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34] },
  { nome: "Lamentações",       cap: 5,   vers: [22,22,66,22,22] },
  { nome: "Ezequiel",          cap: 48,  vers: [28,10,27,21,17,17,14,20,28,22,35,22,22,27,22,29,39,26,22,21,22,27,27,19,42,22,17,18,19,29,22,26,22,22,28,22,11,33,25,8,29,29,35,29,34,39,14,18] },
  { nome: "Daniel",            cap: 12,  vers: [21,49,30,37,31,28,28,27,27,21,45,13] },
  { nome: "Oseias",            cap: 14,  vers: [11,23,5,19,15,11,16,14,17,15,12,14,16,9] },
  { nome: "Joel",              cap: 3,   vers: [20,32,21] },
  { nome: "Amós",              cap: 9,   vers: [15,16,15,13,27,14,17,14,15] },
  { nome: "Obadias",           cap: 1,   vers: [21] },
  { nome: "Jonas",             cap: 4,   vers: [17,10,10,11] },
  { nome: "Miqueias",          cap: 7,   vers: [16,13,12,13,15,16,20] },
  { nome: "Naum",              cap: 3,   vers: [15,13,19] },
  { nome: "Habacuque",         cap: 3,   vers: [17,20,19] },
  { nome: "Sofonias",          cap: 3,   vers: [18,15,20] },
  { nome: "Ageu",              cap: 2,   vers: [15,23] },
  { nome: "Zacarias",          cap: 14,  vers: [21,13,10,14,11,15,14,23,17,12,17,14,9,21] },
  { nome: "Malaquias",         cap: 4,   vers: [14,17,18,6] },
  { nome: "Mateus",            cap: 28,  vers: [25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20] },
  { nome: "Marcos",            cap: 16,  vers: [45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20] },
  { nome: "Lucas",             cap: 24,  vers: [80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53] },
  { nome: "João",              cap: 21,  vers: [51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25] },
  { nome: "Atos",              cap: 28,  vers: [26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,41,38,40,30,35,27,27,32,44,31] },
  { nome: "Romanos",           cap: 16,  vers: [32,29,31,25,21,23,25,39,33,21,36,21,14,26,33,24] },
  { nome: "1 Coríntios",       cap: 16,  vers: [31,16,23,21,13,20,40,13,27,33,34,31,13,54,22,24] },
  { nome: "2 Coríntios",       cap: 13,  vers: [24,17,18,18,21,18,16,24,15,18,33,21,14] },
  { nome: "Gálatas",           cap: 6,   vers: [24,21,29,31,26,18] },
  { nome: "Efésios",           cap: 6,   vers: [23,22,21,28,22,24] },
  { nome: "Filipenses",        cap: 4,   vers: [30,30,21,23] },
  { nome: "Colossenses",       cap: 4,   vers: [29,23,25,18] },
  { nome: "1 Tessalonicenses", cap: 5,   vers: [10,20,13,18,28] },
  { nome: "2 Tessalonicenses", cap: 3,   vers: [12,17,18] },
  { nome: "1 Timóteo",         cap: 6,   vers: [20,15,16,16,25,21] },
  { nome: "2 Timóteo",         cap: 4,   vers: [18,26,17,22] },
  { nome: "Tito",              cap: 3,   vers: [16,15,15] },
  { nome: "Filemom",           cap: 1,   vers: [25] },
  { nome: "Hebreus",           cap: 13,  vers: [14,18,19,16,14,20,28,13,28,39,40,29,25] },
  { nome: "Tiago",             cap: 5,   vers: [27,26,18,17,20] },
  { nome: "1 Pedro",           cap: 5,   vers: [25,25,22,19,14] },
  { nome: "2 Pedro",           cap: 3,   vers: [21,22,18] },
  { nome: "1 João",            cap: 5,   vers: [10,29,24,21,21] },
  { nome: "2 João",            cap: 1,   vers: [13] },
  { nome: "3 João",            cap: 1,   vers: [14] },
  { nome: "Judas",             cap: 1,   vers: [25] },
  { nome: "Apocalipse",        cap: 22,  vers: [20,29,36,22,20,25,28,22,31,23,23,15,49,26,20,68,21,24,29,28,32,34,24] },
];

/* Temas livres pré-definidos */
const TEMAS_FIXOS = [
  "A adoração verdadeira", "Alegria do Senhor", "Amizade com Deus",
  "Andar no Espírito", "Autoridade espiritual", "Bondade e compaixão",
  "Caminhando em obediência", "Chamado de Deus", "Confiança no Senhor",
  "Consagração e santificação", "Coragem para vencer", "Cristo, nossa esperança",
  "Dependência de Deus", "Deus de milagres", "Deus é fiel",
  "Esperança em tempos difíceis", "Família segundo o coração de Deus", "Fé em meio às provas",
  "Força no Espírito Santo", "Generosidade cristã", "Gratidão a Deus",
  "Humildade diante de Deus", "Intimidade com o Espírito Santo", "Jesus, o bom pastor",
  "Justificação pela fé", "Liberdade em Cristo", "Luz do mundo",
  "Maturidade espiritual", "Obediência que gera bênçãos", "O amor de Cristo",
  "O cuidado de Deus", "O fruto da perseverança", "O reino de Deus",
  "O valor da Palavra de Deus", "Paz que excede todo entendimento", "Perseverança na caminhada cristã",
  "Plenitude do Espírito Santo", "Preparados para a volta de Jesus", "Proteção divina",
  "Quebrantamento diante de Deus", "Relacionamento com Deus", "Restauração de vidas",
  "Sabedoria do alto", "Salvação pela graça", "Segurança em Deus",
  "Ser luz e sal da terra", "Tempo de colheita", "Transformação pelo Evangelho",
  "Vida de adoração", "Vida guiada pelo Espírito Santo", "Vivendo as promessas de Deus",
  "Chamados para servir", "Esperando no tempo de Deus", "O Deus do impossível",
  "Vitória sobre o medo", "A paz de Cristo", "Firmes na Palavra",
  "Esperança da vida eterna", "O agir de Deus", "Recomeços com Deus",

  // --- novos temas ---
  "A graça que transforma", "A presença de Deus", "A voz do Senhor",
  "Arrependimento genuíno", "Avivamento e renovação", "Bênçãos da obediência",
  "Buscando a face de Deus", "Clamor que Deus ouve", "Compromisso com o Evangelho",
  "Comunhão dos santos", "Crescendo na fé", "Cruz e ressurreição",
  "Cuidando dos necessitados", "De glória em glória", "Deus nosso refúgio",
  "Discipulado e crescimento", "Edificando o corpo de Cristo", "Ele é digno",
  "Em Cristo somos mais que vencedores", "Enraizados na Palavra", "Evangelismo e missões",
  "Fidelidade no serviço", "Glorificando a Deus em tudo", "Graça e misericórdia",
  "Intercessão e oração", "Jesus, nome acima de todo nome", "Jejum e oração",
  "Louvor como arma espiritual", "Misericórdia que renova", "Morrer para si mesmo",
  "No deserto com Deus", "Nova criação em Cristo", "O Espírito que guia",
  "O poder da ressurreição", "O sacrifício de Cristo", "Oração que move montanhas",
  "Perfeito amor que lança fora o temor", "Perseguição e fidelidade", "Portadores da glória",
  "Proclamando as maravilhas de Deus", "Propósito eterno de Deus", "Reconciliação com Deus",
  "Santidade de vida", "Sede de Deus", "Servindo com alegria",
  "Tempo de despertar", "Testemunho cristão", "Unidade no Espírito",
  "Valentes para Deus", "Vida de oração", "Vitória pelo sangue do Cordeiro",
  "Voltando ao primeiro amor", "Zelo pela casa de Deus"
];
/* ══════════════════════════════════════════════════════
   COMPONENTE: Seletor de Referência Bíblica com Autocomplete
══════════════════════════════════════════════════════ */
function SeletorReferenciaBiblica({ value, onChange, isDark }) {
  const [inputVal,  setInputVal]  = useState(value || "");
  const [sugestoes, setSugestoes] = useState([]);
  const [aberto,    setAberto]    = useState(false);
  const inputRef = useRef(null);

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  // Sincroniza quando valor externo muda (ex: rascunho restaurado)
  useEffect(() => {
    if (value !== inputVal) setInputVal(value || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const gerarSugestoes = (texto) => {
    if (!texto.trim()) { setSugestoes([]); return; }
    const lower = texto.toLowerCase();

    // 1. Sugestões de capítulo:versículo (ex: "João 3" → "João 3:1"...)
    const extrasRef = [];
    const matchRef  = texto.match(/^(.+?)\s+(\d+)(?::(\d+))?/);
    if (matchRef) {
      const nomeBusca = matchRef[1].trim().toLowerCase();
      const cap       = parseInt(matchRef[2]);
      const ver       = matchRef[3] ? parseInt(matchRef[3]) : null;
      const livro     = BIBLIA.find(l => l.nome.toLowerCase().startsWith(nomeBusca));
      if (livro && cap >= 1 && cap <= livro.cap) {
        if (ver === null) {
          extrasRef.push(`${livro.nome} ${cap}`);
          for (let v = 1; v <= Math.min(5, livro.vers[cap - 1]); v++)
            extrasRef.push(`${livro.nome} ${cap}:${v}`);
        } else if (ver >= 1 && ver <= livro.vers[cap - 1]) {
          extrasRef.push(`${livro.nome} ${cap}:${ver}`);
        }
      }
    }

    // 2. Livros que contêm o texto
    const livrosMatch = BIBLIA
        .filter(l => l.nome.toLowerCase().includes(lower))
        .slice(0, 4)
        .map(l => l.nome);

    // 3. Temas livres que contêm o texto
    const temasMatch = TEMAS_FIXOS
        .filter(t => t.toLowerCase().includes(lower))
        .slice(0, 4);

    const todas = [...new Set([...extrasRef, ...livrosMatch, ...temasMatch])].slice(0, 7);

    // Texto digitado sempre aparece como primeira opção (se não for idêntico a alguma sugestão)
    const digitadoLimpo = texto.trim();
    if (digitadoLimpo && !todas.some(s => s.toLowerCase() === lower)) {
      todas.unshift(digitadoLimpo);
    }

    setSugestoes(todas.slice(0, 7));
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    onChange(val);
    gerarSugestoes(val);
    setAberto(true);
  };

  const handleSelect = (sugestao) => {
    setInputVal(sugestao);
    onChange(sugestao);
    setSugestoes([]);
    setAberto(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setInputVal("");
    onChange("");
    setSugestoes([]);
    inputRef.current?.focus();
  };

  return (
      <div>
        <label className="ieq-label">
          <BookOpen size={11} style={{ display: "inline", marginRight: 6 }} />
          TEMA / REFERÊNCIA BÍBLICA
        </label>

        <div style={{ position: "relative" }}>
          <input
              ref={inputRef}
              className="ieq-input"
              type="text"
              placeholder="Ex: João 3:16 ou A fé que move..."
              value={inputVal}
              onChange={handleChange}
              onFocus={() => { if (inputVal.trim()) { gerarSugestoes(inputVal); setAberto(true); } }}
              onBlur={() => setTimeout(() => setAberto(false), 160)}
              autoComplete="off"
              spellCheck={false}
          />
          {inputVal && (
              <button
                  onMouseDown={e => { e.preventDefault(); handleClear(); }}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: ts, fontSize: 18, lineHeight: 1, padding: "2px 4px",
                  }}
              >×</button>
          )}

          {/* Dropdown de sugestões */}
          {aberto && sugestoes.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
                background: isDark ? "#1a0a0d" : "#fff",
                border: `1px solid ${isDark ? "rgba(200,16,46,.3)" : "rgba(200,16,46,.22)"}`,
                borderRadius: 10, overflow: "hidden",
                boxShadow: "0 8px 28px rgba(0,0,0,.22)",
              }}>
                {sugestoes.map((s, i) => {
                  const isDigitado = i === 0 && s === inputVal.trim() && !BIBLIA.some(l => l.nome === s) && !TEMAS_FIXOS.includes(s);
                  const isRef      = /\d/.test(s) && !isDigitado;
                  return (
                      <button
                          key={i}
                          onMouseDown={() => handleSelect(s)}
                          style={{
                            width: "100%", background: "none", border: "none", cursor: "pointer",
                            padding: "11px 16px", textAlign: "left",
                            fontFamily: "'EB Garamond',serif", fontSize: 15, color: tp,
                            borderBottom: i < sugestoes.length - 1
                                ? `1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"}` : "none",
                            display: "flex", alignItems: "center", gap: 10,
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(200,16,46,.09)" : "rgba(200,16,46,.05)"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        {isDigitado
                            ? <Edit3      size={13} style={{ color: ts,       flexShrink: 0 }} />
                            : isRef
                                ? <BookOpen   size={13} style={{ color: IEQ.red,  flexShrink: 0 }} />
                                : <CheckCircle2 size={13} style={{ color: IEQ.blue, flexShrink: 0 }} />
                        }
                        <span style={{ flex: 1 }}>{s}</span>
                        {isDigitado && (
                            <span style={{
                              fontFamily: "'Cinzel',serif", fontSize: 7.5,
                              letterSpacing: ".14em", color: ts,
                            }}>USAR ESTE</span>
                        )}
                      </button>
                  );
                })}
              </div>
          )}
        </div>

        {/* Preview do valor selecionado */}
        {value && (
            <div style={{
              marginTop: 10, padding: "10px 14px",
              background: isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.05)",
              border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}`,
              borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
            }}>
              <BookOpen size={14} style={{ color: IEQ.red, flexShrink: 0 }} />
              <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: 600, color: tp }}>
            {value}
          </span>
            </div>
        )}
      </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPONENTE: Cruz Quadrangular
══════════════════════════════════════════════════════ */
function QuadrangularCross({ size = 32 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gVR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={IEQ.redLight} /><stop offset="100%" stopColor={IEQ.redDark} />
          </linearGradient>
          <linearGradient id="gHR" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={IEQ.blueDark} /><stop offset="50%" stopColor={IEQ.blueLight} /><stop offset="100%" stopColor={IEQ.blueDark} />
          </linearGradient>
          <filter id="glowR"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="38" y="4"  width="24" height="92" rx="3" fill="url(#gVR)" filter="url(#glowR)" />
        <rect x="4"  y="38" width="92" height="24" rx="3" fill="url(#gHR)" filter="url(#glowR)" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill={IEQ.yellow} filter="url(#glowR)" />
        <rect x="43" y="43" width="14" height="14" rx="1" fill="#FFE066" opacity="0.55" />
      </svg>
  );
}

/* ══════════════════════════════════════════════════════
   COMPONENTE: Toast de Sucesso Animado
══════════════════════════════════════════════════════ */
function ToastSucesso({ total, estudo, nomeCelula, onClose }) {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSaindo(true);
      setTimeout(() => { if (onClose) onClose(); }, 450);
    }, 4800);
    return () => clearTimeout(t);
  }, [onClose]);

  const confettiCores = [
    IEQ.yellow, IEQ.red, IEQ.blue, IEQ.yellow,
    IEQ.redLight, IEQ.blueLight, IEQ.yellow, IEQ.red,
  ];

  return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 20px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        animation: saindo ? "ieqOverlayOut .45s ease forwards" : "ieqOverlayIn .3s ease forwards",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
          animation: saindo ? "ieqToastOut .45s cubic-bezier(.4,0,.6,1) forwards" : "ieqToastIn .55s cubic-bezier(.34,1.56,.64,1) forwards",
        }}>
          {/* Confetes */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, height: 32, alignItems: "flex-end" }}>
            {confettiCores.map((cor, i) => (
                <div key={i} style={{
                  width: i % 3 === 0 ? 12 : 8, height: i % 3 === 0 ? 12 : 8,
                  borderRadius: i % 2 === 0 ? "50%" : 2, background: cor, opacity: 0,
                  animation: `ieqConfetti 1.4s ease ${0.04 + i * 0.06}s forwards`,
                }} />
            ))}
          </div>

          {/* Card principal */}
          <div style={{
            background: "linear-gradient(160deg, #0d6e3a 0%, #0a5530 60%, #073d22 100%)",
            borderRadius: 22, padding: "32px 40px 28px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
            minWidth: 300, maxWidth: 380, width: "100%",
            boxShadow: "0 16px 60px rgba(13,110,58,.5), 0 0 0 1px rgba(255,255,255,.08)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(253,184,19,.06)", pointerEvents: "none" }} />

            {/* Ícone com anel pulsante */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "2px solid rgba(255,255,255,.25)", animation: "ieqRingPulse 2s ease-out forwards" }} />
              <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.12)", animation: "ieqRingPulse 2s ease-out .3s forwards" }} />
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "2px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={32} style={{ color: "#fff" }} />
              </div>
            </div>

            <div style={{ marginTop: -6, marginBottom: -6 }}><QuadrangularCross size={22} /></div>

            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, letterSpacing: ".18em", color: "#fff", margin: "0 0 8px" }}>
                GLÓRIA A DEUS!
              </p>
              <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 18, color: "rgba(255,255,255,.82)", lineHeight: 1.55, margin: 0 }}>
                Relatório enviado com sucesso.<br /><em>O Senhor viu cada presença!</em>
              </p>
            </div>

            <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent)" }} />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 20, padding: "6px 14px", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", gap: 6 }}>
                <Users2 size={12} /> {total} PRESENTES
              </div>
              {estudo && (
                  <div style={{ background: "rgba(253,184,19,.15)", border: "1px solid rgba(253,184,19,.3)", borderRadius: 20, padding: "6px 14px", fontFamily: "'EB Garamond',serif", fontSize: 14, fontWeight: 600, color: IEQ.yellow, display: "flex", alignItems: "center", gap: 6 }}>
                    <BookOpen size={12} /> {estudo}
                  </div>
              )}
              {nomeCelula && (
                  <div style={{ background: "rgba(0,61,165,.2)", border: "1px solid rgba(0,61,165,.35)", borderRadius: 20, padding: "6px 14px", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".12em", color: "rgba(255,255,255,.85)", display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={12} /> {nomeCelula.toUpperCase()}
                  </div>
              )}
            </div>

            <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 14, color: "rgba(255,255,255,.5)", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
              "Porque onde dois ou três estão reunidos em meu nome, ali estou no meio deles."
            </p>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: "rgba(255,255,255,.35)", margin: "-12px 0 0" }}>
              MATEUS 18:20
            </p>
          </div>
        </div>
      </div>
  );
}

/* ══════════════════════════════════════════════════════
   TELA DE EDIÇÃO DE RELATÓRIO EXISTENTE
══════════════════════════════════════════════════════ */
function TelaEditarRelatorio({ relatorioId, onVoltar, onSalvo, isDark = false }) {
  const [loading,       setLoading]       = useState(true);
  const [salvando,      setSalvando]      = useState(false);
  const [pessoas,       setPessoas]       = useState([]);
  const [nomeCelula,    setNomeCelula]    = useState("");
  const [nomeLider,     setNomeLider]     = useState("");
  const [celulaId,      setCelulaId]      = useState(null);
  const [sucesso,       setSucesso]       = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());

  const [form, setForm] = useState({
    dataReuniao: "",
    estudo: "",
    selecionadosKeys: [],
    decisoes: {},
  });

  const tp = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const headers = { Authorization: `Bearer ${token}` };

      const resRelatorio = await api.get(`/relatorios/${relatorioId}`, { headers });
      const rel = resRelatorio.data;

      setNomeCelula(rel.nomeCelula || "");
      setNomeLider(rel.nomeLider || "");
      setCelulaId(rel.celulaId);

      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${rel.celulaId}/membros`,          { headers }),
        api.get(`/visitantes/celula/${rel.celulaId}/ativos`, { headers }),
      ]);

      const membros    = (resMembros.data    || []).map(m => ({ id: m.id, nome: m.nome, tipo: "MEMBRO",    uKey: `MEMBRO-${m.id}` }));
      const visitantes = (resVisitantes.data || []).map(v => ({ id: v.id, nome: v.nome, tipo: "VISITANTE", uKey: `VISITANTE-${v.id}` }));
      setPessoas([...membros, ...visitantes].sort((a, b) => a.nome.localeCompare(b.nome)));

      const keysPresentes = [
        ...(rel.membrosPresentes    || []).map(m => `MEMBRO-${m.id}`),
        ...(rel.visitantesPresentes || []).map(v => `VISITANTE-${v.id}`),
      ];

      const decisoesIniciais = {};
      (rel.visitantesPresentes || []).forEach(v => {
        decisoesIniciais[`VISITANTE-${v.id}`] = v.decisaoEspiritual || "NENHUMA";
      });

      setForm({
        dataReuniao:      rel.dataReuniao || "",
        estudo:           rel.estudo      || "",
        selecionadosKeys: keysPresentes,
        decisoes:         decisoesIniciais,
      });
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      alert("Não foi possível carregar o relatório.");
    } finally {
      setLoading(false);
    }
  }, [relatorioId]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds(prev => new Set(prev).add(uKey));
    setForm(prev => {
      const novasKeys     = isMarcado ? prev.selecionadosKeys.filter(k => k !== uKey) : [...prev.selecionadosKeys, uKey];
      const novasDecisoes = { ...prev.decisoes };
      if (isMarcado) delete novasDecisoes[uKey];
      return { ...prev, selecionadosKeys: novasKeys, decisoes: novasDecisoes };
    });
    setTimeout(() => setProcessingIds(prev => { const n = new Set(prev); n.delete(uKey); return n; }), 200);
  };

  const membrosPresentes    = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).length;
  const visitantesPresentes = form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).length;
  const total               = membrosPresentes + visitantesPresentes;

  const handleSalvar = async () => {
    if (!form.estudo.trim()) return alert("Informe o tema ou referência bíblica do estudo.");
    try {
      setSalvando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const payload = {
        celulaId: Number(celulaId),
        dataReuniao: form.dataReuniao,
        estudo: form.estudo.trim(),
        membrosPresentesIds: form.selecionadosKeys
            .filter(k => k.startsWith("MEMBRO-"))
            .map(k => Number(k.replace("MEMBRO-", ""))),
        visitantesPresentes: form.selecionadosKeys
            .filter(k => k.startsWith("VISITANTE-"))
            .map(k => ({
              id: Number(k.replace("VISITANTE-", "")),
              decisaoEspiritual: form.decisoes[k] || "NENHUMA",
            })),
        quantidadeVisitantes: 0,
      };

      await api.put(`/relatorios/${relatorioId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSucesso(true);
      setTimeout(() => { setSucesso(false); if (onSalvo) onSalvo(); }, 2200);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <QuadrangularCross size={40} />
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".2em", color: IEQ.red, marginTop: 14 }}>CARREGANDO RELATÓRIO...</p>
        </div>
      </div>
  );

  return (
      <div style={{ minHeight: "100vh", position: "relative", paddingBottom: 120 }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>

          <div style={{ paddingTop: 20, paddingBottom: 8 }}>
            <button
                onClick={onVoltar}
                style={{
                  background: "none", border: `1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"}`,
                  color: tp, padding: "9px 16px", borderRadius: 8, cursor: "pointer",
                  fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".15em",
                  display: "flex", alignItems: "center", gap: 8,
                }}
            >
              <ArrowLeft size={13} /> VOLTAR
            </button>
          </div>

          {sucesso && (
              <div style={{
                marginBottom: 12, animation: "fadeIn .4s ease",
                background: "linear-gradient(135deg,#0d6e3a,#0a5530)",
                borderRadius: 10, padding: "14px 20px",
                display: "flex", alignItems: "center", gap: 12,
                fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".16em", color: "#fff",
                boxShadow: "0 4px 20px rgba(13,110,58,.4)",
              }}>
                <CheckCircle2 size={16} /> RELATÓRIO ATUALIZADO COM SUCESSO!
              </div>
          )}

          <div style={{
            marginBottom: 12,
            background: "linear-gradient(135deg,rgba(253,184,19,.15),rgba(196,140,0,.1))",
            border: "1px solid rgba(253,184,19,.3)",
            borderRadius: 10, padding: "13px 18px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <AlertTriangle size={16} style={{ color: IEQ.yellow, flexShrink: 0 }} />
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".14em", color: IEQ.yellowDark, margin: 0 }}>
              MODO EDIÇÃO — Você está alterando um relatório já enviado.
            </p>
          </div>

          {/* Header edição */}
          <div style={{
            padding: "36px 40px 32px", marginBottom: 24,
            background: isDark ? "linear-gradient(135deg,#1A0A0D,#0A0608)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
            borderRadius: 14, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-55deg,rgba(255,255,255,.03) 0 10px,transparent 10px 20px)", backgroundSize: "40px 40px" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(200,16,46,.35)", animation: "pulse 3s ease-in-out infinite" }} />
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Edit3 size={22} style={{ color: "#fff" }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".22em", color: "rgba(255,255,255,.5)", margin: 0 }}>EDITANDO RELATÓRIO #{relatorioId}</p>
                  <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "4px 0 0", letterSpacing: ".1em" }}>
                    {nomeCelula.toUpperCase()}
                  </h1>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserCheck size={18} style={{ color: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: "rgba(255,255,255,.5)", margin: 0 }}>LÍDER RESPONSÁVEL</p>
                  <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{nomeLider}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campos data + tema */}
          <div className="ieq-card" style={{ padding: "26px 28px", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="ieq-label"><Calendar size={11} style={{ display: "inline", marginRight: 6 }} />DATA DA REUNIÃO</label>
                <input className="ieq-input" type="date" value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
              </div>
              <div>
                <SeletorReferenciaBiblica value={form.estudo} onChange={val => setForm({ ...form, estudo: val })} isDark={isDark} />
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "MEMBROS",    val: membrosPresentes,    color: IEQ.red },
              { label: "VISITANTES", val: visitantesPresentes, color: IEQ.blue },
              { label: "TOTAL",      val: total,               color: IEQ.yellow, highlight: true },
            ].map(({ label, val, color, highlight }) => (
                <div key={label} className="ieq-kpi" style={highlight ? { background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border: "none" } : {}}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: highlight ? "rgba(255,255,255,.6)" : ts, margin: "0 0 6px" }}>{label}</p>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 38, fontWeight: 700, color: highlight ? "#fff" : color, margin: 0, lineHeight: 1 }}>{val}</p>
                </div>
            ))}
          </div>

          {/* Chamada */}
          <div className="ieq-card" style={{ overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, display: "flex", alignItems: "center", gap: 10 }}>
              <Users2 size={18} style={{ color: IEQ.red }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: tp }}>CHAMADA</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".12em", color: ts, marginLeft: "auto" }}>{pessoas.length} PESSOAS</span>
            </div>
            <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
              {pessoas.map((pessoa) => {
                const marcado     = form.selecionadosKeys.includes(pessoa.uKey);
                const isVisitante = pessoa.tipo === "VISITANTE";
                const processing  = processingIds.has(pessoa.uKey);
                return (
                    <div key={pessoa.uKey} className="ieq-person-row" style={{ background: marcado ? (isDark ? "rgba(200,16,46,.07)" : "rgba(200,16,46,.05)") : "transparent" }}>
                      <button
                          onClick={() => alternarPresenca(pessoa.uKey)}
                          disabled={processing}
                          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", transition: "all .2s" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 8,
                            background: marcado ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.08)"),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: marcado ? "#fff" : (isDark ? IEQ.offWhite : "#1A0A0D"),
                            fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16,
                            transition: "all .3s", transform: marcado ? "scale(1.05)" : "scale(1)",
                          }}>
                            {processing ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : pessoa.nome.charAt(0)}
                          </div>
                          <div style={{ textAlign: "left" }}>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: marcado ? 600 : 400, color: marcado ? tp : ts, margin: 0 }}>{pessoa.nome}</p>
                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".15em", color: isVisitante ? IEQ.yellow : IEQ.red }}>{pessoa.tipo}</span>
                          </div>
                        </div>
                        <div style={{
                          width: 26, height: 26, borderRadius: 6,
                          border: `2px solid ${marcado ? IEQ.red : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)")}`,
                          background: marcado ? IEQ.red : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s",
                        }}>
                          {marcado && <CheckCircle2 size={14} style={{ color: "#fff" }} />}
                        </div>
                      </button>
                      {marcado && isVisitante && (
                          <div style={{ padding: "0 24px 18px 82px" }}>
                            <div className="ieq-card" style={{ padding: "16px 18px" }}>
                              <label className="ieq-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Trophy size={11} /> DECISÃO ESPIRITUAL
                              </label>
                              <div style={{ position: "relative" }}>
                                <select
                                    className="ieq-select"
                                    value={form.decisoes[pessoa.uKey] || "NENHUMA"}
                                    onChange={e => setForm(prev => ({ ...prev, decisoes: { ...prev.decisoes, [pessoa.uKey]: e.target.value } }))}
                                >
                                  <option value="NENHUMA">Só visita</option>
                                  <option value="ACEITOU_JESUS">Aceitou Jesus</option>
                                  <option value="RECONCILIOU">Reconciliou</option>
                                  <option value="BATISMO_AGUAS">Deseja Batismo</option>
                                </select>
                                <ChevronDown size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: ts, pointerEvents: "none" }} />
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botão salvar fixo */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 24px", zIndex: 50,
          background: isDark ? "linear-gradient(to top,rgba(10,6,8,1) 60%,transparent)" : "linear-gradient(to top,rgba(240,234,232,1) 60%,transparent)",
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <button
                onClick={handleSalvar}
                disabled={salvando || !form.estudo.trim()}
                style={{
                  width: "100%", padding: "17px 0", borderRadius: 10, border: "none",
                  background: (salvando || !form.estudo.trim()) ? "rgba(200,16,46,.3)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
                  color: "#fff", cursor: (salvando || !form.estudo.trim()) ? "not-allowed" : "pointer",
                  fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".22em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .25s",
                }}
            >
              {salvando
                  ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> SALVANDO...</>
                  : <><ClipboardCheck size={17} /> SALVAR ALTERAÇÕES ({total} PRESENTES)</>
              }
            </button>
          </div>
        </div>
      </div>
  );
}

/* ══════════════════════════════════════════════════════
   TELA PRINCIPAL — NOVO RELATÓRIO + HISTÓRICO
══════════════════════════════════════════════════════ */
export default function TelaRelatorio({ isDark = false }) {
  const [modo,            setModo]            = useState("novo");
  const [relatorioEditId, setRelatorioEditId] = useState(null);
  const [modalDuplicado,  setModalDuplicado]  = useState(null);

  const [celula,        setCelula]        = useState(null);
  const [pessoas,       setPessoas]       = useState([]);
  const [historico,     setHistorico]     = useState([]);
  const [loadingHist,   setLoadingHist]   = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [enviando,      setEnviando]      = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [rascunhoCarregado, setRascunhoCarregado] = useState(false);
  const [toastSucesso,  setToastSucesso]  = useState(null);

  const prontoParaSalvar = useRef(false);

  const [form, setForm] = useState({
    celulaId: null,
    dataReuniao: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })(),
    estudo: "",
    selecionadosKeys: [],
    decisoes: {},
  });

  // Salva rascunho automaticamente
  useEffect(() => {
    if (!prontoParaSalvar.current || !form.celulaId) return;
    try {
      localStorage.setItem(draftKey(form.celulaId), JSON.stringify({
        dataReuniao:      form.dataReuniao,
        estudo:           form.estudo,
        selecionadosKeys: form.selecionadosKeys,
        decisoes:         form.decisoes,
        salvoEm:          new Date().toISOString(),
      }));
    } catch (err) { console.warn("Não foi possível salvar rascunho:", err); }
  }, [form]);

  const carregarDados = useCallback(async () => {
    try {
      prontoParaSalvar.current = false;
      setLoading(true);
      const token   = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const headers = { Authorization: `Bearer ${token}` };
      const resCelula   = await api.get("/celulas/minha-celula", { headers });
      const dadosCelula = resCelula.data;
      setCelula(dadosCelula);

      const [resMembros, resVisitantes] = await Promise.all([
        api.get(`/celulas/${dadosCelula.id}/membros`,          { headers }),
        api.get(`/visitantes/celula/${dadosCelula.id}/ativos`, { headers }),
      ]);
      const membros    = (resMembros.data    || []).map(m => ({ id: m.id, nome: m.nome, tipo: "MEMBRO",    uKey: `MEMBRO-${m.id}` }));
      const visitantes = (resVisitantes.data || []).map(v => ({ id: v.id, nome: v.nome, tipo: "VISITANTE", uKey: `VISITANTE-${v.id}` }));
      setPessoas([...membros, ...visitantes].sort((a, b) => a.nome.localeCompare(b.nome)));

      let restaurou = false;
      try {
        const raw = localStorage.getItem(draftKey(dadosCelula.id));
        if (raw) {
          const draft = JSON.parse(raw);
          setForm({
            celulaId:         dadosCelula.id,
            dataReuniao:      draft.dataReuniao || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })(),
            estudo:           draft.estudo || "",
            selecionadosKeys: draft.selecionadosKeys || [],
            decisoes:         draft.decisoes || {},
          });
          restaurou = true;
          setRascunhoCarregado(true);
          setTimeout(() => setRascunhoCarregado(false), 4000);
        }
      } catch (err) { console.warn("Erro ao ler rascunho:", err); }

      if (!restaurou) setForm(prev => ({ ...prev, celulaId: dadosCelula.id }));
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const carregarHistorico = useCallback(async () => {
    try {
      setLoadingHist(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res   = await api.get("/relatorios/historico", { headers: { Authorization: `Bearer ${token}` } });
      setHistorico(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoadingHist(false);
    }
  }, []);

  useEffect(() => {
    if (modo === "historico") carregarHistorico();
  }, [modo, carregarHistorico]);

  const alternarPresenca = (uKey) => {
    const isMarcado = form.selecionadosKeys.includes(uKey);
    setProcessingIds(prev => new Set(prev).add(uKey));
    setForm(prev => {
      const novasKeys     = isMarcado ? prev.selecionadosKeys.filter(k => k !== uKey) : [...prev.selecionadosKeys, uKey];
      const novasDecisoes = { ...prev.decisoes };
      if (isMarcado) delete novasDecisoes[uKey];
      return { ...prev, selecionadosKeys: novasKeys, decisoes: novasDecisoes };
    });
    setTimeout(() => setProcessingIds(prev => { const n = new Set(prev); n.delete(uKey); return n; }), 200);
  };

  const membrosPresentes    = form.selecionadosKeys.filter(k => k.startsWith("MEMBRO-")).length;
  const visitantesPresentes = form.selecionadosKeys.filter(k => k.startsWith("VISITANTE-")).length;
  const total               = membrosPresentes + visitantesPresentes;

  const handleSubmit = async () => {
    if (!form.estudo.trim()) return alert("Informe o tema ou referência bíblica do estudo.");

    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();
      const res   = await api.get("/relatorios/historico", { headers: { Authorization: `Bearer ${token}` } });
      const existente = (res.data || []).find(r => r.dataReuniao === form.dataReuniao);
      if (existente) {
        setModalDuplicado({ relatorioId: existente.id, dataReuniao: existente.dataReuniao, estudo: existente.estudo || "Sem tema" });
        return;
      }
    } catch (err) { console.warn("Não foi possível verificar duplicata:", err); }

    try {
      setEnviando(true);
      const token = localStorage.getItem("token")?.replace(/"/g, "").trim();

      const totalEnviado  = total;
      const estudoEnviado = form.estudo;
      const nomeCell      = celula?.nome || "";

      const payload = {
        celulaId:    Number(form.celulaId),
        dataReuniao: form.dataReuniao,
        estudo:      form.estudo.trim(),
        membrosPresentesIds: form.selecionadosKeys
            .filter(k => k.startsWith("MEMBRO-"))
            .map(k => Number(k.replace("MEMBRO-", ""))),
        visitantesPresentes: form.selecionadosKeys
            .filter(k => k.startsWith("VISITANTE-"))
            .map(k => ({
              id: Number(k.replace("VISITANTE-", "")),
              decisaoEspiritual: form.decisoes[k] || "NENHUMA",
            })),
      };

      await api.post("/relatorios", payload, { headers: { Authorization: `Bearer ${token}` } });

      try { localStorage.removeItem(draftKey(form.celulaId)); } catch (_) {}
      prontoParaSalvar.current = false;
      setForm(f => ({ ...f, estudo: "", selecionadosKeys: [], decisoes: {} }));
      setTimeout(() => { prontoParaSalvar.current = true; }, 0);

      setToastSucesso({ total: totalEnviado, estudo: estudoEnviado, nomeCelula: nomeCell });
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao enviar relatório.");
    } finally { setEnviando(false); }
  };

  const nomeCelula       = celula?.nome || "Carregando...";
  const nomeUsuarioLider = celula?.nomeLider || celula?.lider?.nome || celula?.usuario?.nome || "Líder";
  const tp       = isDark ? IEQ.offWhite : "#1A0A0D";
  const ts       = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";
  const selectBg = isDark ? "#1a0a0d" : "#ffffff";

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    * { box-sizing:border-box; }
    @keyframes stripe  { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes pulse   { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.12);opacity:.12} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes fadeIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes modalIn { from{opacity:0;transform:scale(.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes ieqOverlayIn  { from{opacity:0} to{opacity:1} }
    @keyframes ieqOverlayOut { from{opacity:1} to{opacity:0} }
    @keyframes ieqToastIn    { from{opacity:0;transform:scale(.88) translateY(28px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes ieqToastOut   { from{opacity:1;transform:scale(1) translateY(0)} to{opacity:0;transform:scale(.92) translateY(-18px)} }
    @keyframes ieqRingPulse  { 0%{opacity:0;transform:scale(.85)} 40%{opacity:.7} 100%{opacity:0;transform:scale(1.55)} }
    @keyframes ieqConfetti   { 0%{opacity:0;transform:translateY(-20px) rotate(0deg) scale(.5)} 35%{opacity:1;transform:translateY(4px) rotate(120deg) scale(1)} 100%{opacity:.15;transform:translateY(22px) rotate(260deg) scale(.8)} }
    .ieq-bg-stripe {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background:repeating-linear-gradient(-55deg,
        ${isDark ? "rgba(200,16,46,.04)" : "rgba(200,16,46,.05)"} 0 10px,transparent 10px 20px,
        ${isDark ? "rgba(253,184,19,.03)" : "rgba(253,184,19,.04)"} 20px 30px,transparent 30px 40px);
      background-size:60px 60px; animation:stripe 8s linear infinite;
    }
    .ieq-card {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:14px; backdrop-filter:blur(24px);
    }
    .ieq-input {
      width:100%;
      background:${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${tp}; padding:12px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; transition:all .25s;
    }
    .ieq-input:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-input::placeholder { color:${ts}; }
    .ieq-select {
      width:100%; background:${selectBg};
      border:1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)"};
      color:${tp}; padding:12px 16px; border-radius:8px; outline:none;
      font-family:'EB Garamond',serif; font-size:15px; cursor:pointer; transition:all .25s;
      -webkit-appearance:none; appearance:none;
    }
    .ieq-select:focus { border-color:${IEQ.red}; box-shadow:0 0 0 3px rgba(200,16,46,.12); }
    .ieq-select option { background:${selectBg}; color:${tp}; }
    .ieq-label {
      display:block; margin-bottom:6px;
      font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.18em; color:${IEQ.red};
    }
    .ieq-person-row {
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      transition:background .2s;
    }
    .ieq-person-row:last-child { border-bottom:none; }
    .ieq-kpi {
      background:${isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"};
      border:1px solid ${isDark ? "rgba(200,16,46,.15)" : "rgba(200,16,46,.12)"};
      border-radius:12px; padding:20px; text-align:center;
    }
    .ieq-toast {
      animation:fadeIn .35s ease;
      background:linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark});
      border-radius:10px; padding:12px 18px;
      display:flex; align-items:center; gap:10px;
      font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.16em; color:#fff;
      box-shadow:0 4px 20px rgba(0,61,165,.35);
    }
    .pulse-ring { position:absolute; border-radius:50%; border:1px solid rgba(200,16,46,.35); animation:pulse 3s ease-in-out infinite; }
    .spin-icon  { animation:spin 1s linear infinite; }
    .divider    { height:1px; background:linear-gradient(90deg,transparent,${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"},transparent); }
    .ieq-tab {
      flex:1; padding:12px; border:none; cursor:pointer;
      font-family:'Cinzel',serif; font-size:9px; letter-spacing:.16em;
      transition:all .25s; display:flex; align-items:center; justify-content:center; gap:7px;
    }
    .ieq-hist-card {
      border-bottom:1px solid ${isDark ? "rgba(200,16,46,.08)" : "rgba(200,16,46,.07)"};
      padding:18px 20px; display:flex; align-items:center; justify-content:space-between;
      transition:background .2s;
    }
    .ieq-hist-card:last-child { border-bottom:none; }
    .ieq-edit-btn {
      display:flex; align-items:center; gap:6px;
      padding:8px 14px; border-radius:7px; border:none; cursor:pointer;
      font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:.14em;
      background:linear-gradient(135deg,${IEQ.redDark},${IEQ.red}); color:#fff;
      transition:opacity .2s;
    }
    .ieq-edit-btn:hover { opacity:.85; }
    .ieq-modal-overlay {
      position:fixed; inset:0; z-index:200;
      background:rgba(0,0,0,.6); backdrop-filter:blur(5px);
      display:flex; align-items:center; justify-content:center; padding:0 20px;
    }
    .ieq-modal-box {
      background:${isDark ? "#110A0D" : "#fff"};
      border:1px solid rgba(253,184,19,.35);
      border-radius:16px; padding:28px 28px 24px;
      max-width:420px; width:100%;
      animation:modalIn .3s cubic-bezier(.34,1.56,.64,1);
      box-shadow:0 20px 60px rgba(0,0,0,.4);
    }
    .ieq-modal-cancel {
      flex:1; padding:13px 0; border-radius:9px;
      border:1px solid ${isDark ? "rgba(200,16,46,.25)" : "rgba(200,16,46,.2)"};
      background:transparent; color:${tp}; cursor:pointer;
      font-family:'Cinzel',serif; font-size:9px; letter-spacing:.16em;
      transition:background .2s;
    }
    .ieq-modal-cancel:hover { background:${isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"}; }
    .ieq-modal-confirm {
      flex:1; padding:13px 0; border-radius:9px; border:none;
      background:linear-gradient(135deg,${IEQ.yellowDark},${IEQ.yellow});
      color:${IEQ.dark}; cursor:pointer;
      font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:.16em;
      display:flex; align-items:center; justify-content:center; gap:8px;
      transition:opacity .2s;
    }
    .ieq-modal-confirm:hover { opacity:.88; }
  `;

  /* ── Tela de edição ── */
  if (modo === "editar" && relatorioEditId) {
    return (
        <>
          <style>{globalStyles}</style>
          <div className="ieq-bg-stripe" />
          <TelaEditarRelatorio
              relatorioId={relatorioEditId}
              isDark={isDark}
              onVoltar={() => { setModo("historico"); setRelatorioEditId(null); }}
              onSalvo={() => { setModo("historico"); setRelatorioEditId(null); carregarHistorico(); }}
          />
        </>
    );
  }

  if (loading) return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <QuadrangularCross size={40} />
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".2em", color: IEQ.red, marginTop: 14 }}>CARREGANDO...</p>
        </div>
      </div>
  );

  return (
      <div style={{ minHeight: "100vh", position: "relative", paddingBottom: 120 }}>
        <style>{globalStyles}</style>
        <div className="ieq-bg-stripe" />

        {/* Toast de sucesso */}
        {toastSucesso && (
            <ToastSucesso
                total={toastSucesso.total}
                estudo={toastSucesso.estudo}
                nomeCelula={toastSucesso.nomeCelula}
                onClose={() => setToastSucesso(null)}
            />
        )}

        {/* Modal duplicado */}
        {modalDuplicado && (
            <div className="ieq-modal-overlay" onClick={() => setModalDuplicado(null)}>
              <div className="ieq-modal-box" onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, background: "rgba(253,184,19,.15)", border: "1px solid rgba(253,184,19,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={22} style={{ color: IEQ.yellow }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".2em", fontWeight: 700, color: tp, margin: 0 }}>RELATÓRIO JÁ ENVIADO</p>
                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, margin: "3px 0 0" }}>
                      {new Date(modalDuplicado.dataReuniao + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, color: ts, lineHeight: 1.65, margin: "0 0 16px" }}>
                  Já existe um relatório enviado para esta data. Deseja{" "}
                  <strong style={{ color: tp, fontWeight: 600 }}>editar o relatório existente</strong>{" "}
                  em vez de criar um novo?
                </p>
                <div style={{ background: isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.08)", border: "1px solid rgba(253,184,19,.25)", borderRadius: 10, padding: "14px 18px", marginBottom: 22 }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".16em", color: IEQ.yellowDark, margin: "0 0 5px" }}>REFERÊNCIA EXISTENTE</p>
                  <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 17, fontWeight: 600, color: tp, margin: 0 }}>{modalDuplicado.estudo}</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ieq-modal-cancel" onClick={() => setModalDuplicado(null)}>CANCELAR</button>
                  <button
                      className="ieq-modal-confirm"
                      onClick={() => { const id = modalDuplicado.relatorioId; setModalDuplicado(null); setRelatorioEditId(id); setModo("editar"); }}
                  >
                    <Edit3 size={14} /> EDITAR EXISTENTE
                  </button>
                </div>
              </div>
            </div>
        )}

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>

          {/* Abas */}
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", margin: "16px 0", border: `1px solid ${isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.15)"}` }}>
            {[
              { key: "novo",      label: "NOVO RELATÓRIO", icon: <ClipboardCheck size={13} /> },
              { key: "historico", label: "HISTÓRICO",      icon: <History size={13} /> },
            ].map(tab => (
                <button
                    key={tab.key}
                    className="ieq-tab"
                    onClick={() => setModo(tab.key)}
                    style={{
                      background: modo === tab.key
                          ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`
                          : (isDark ? "rgba(17,10,13,.97)" : "rgba(255,255,255,.92)"),
                      color: modo === tab.key ? "#fff" : ts,
                    }}
                >
                  {tab.icon} {tab.label}
                </button>
            ))}
          </div>

          {/* ABA: HISTÓRICO */}
          {modo === "historico" && (
              <div className="ieq-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <History size={18} style={{ color: IEQ.red }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: tp }}>SEUS RELATÓRIOS</span>
                </div>
                {loadingHist ? (
                    <div style={{ padding: 40, textAlign: "center" }}>
                      <Loader2 size={28} style={{ color: IEQ.red, animation: "spin 1s linear infinite" }} />
                    </div>
                ) : historico.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center" }}>
                      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".16em", color: ts }}>NENHUM RELATÓRIO ENCONTRADO</p>
                    </div>
                ) : (
                    historico.map(rel => (
                        <div key={rel.id} className="ieq-hist-card">
                          <div>
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".14em", color: tp, margin: "0 0 4px" }}>
                              {rel.dataReuniao ? new Date(rel.dataReuniao + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "?"}
                            </p>
                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 14, color: ts, margin: "0 0 6px" }}>{rel.estudo || "Sem referência"}</p>
                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".12em", color: IEQ.red }}>{rel.totalPresentes || 0} PRESENTES</span>
                          </div>
                          <button className="ieq-edit-btn" onClick={() => { setRelatorioEditId(rel.id); setModo("editar"); }}>
                            <Edit3 size={12} /> EDITAR
                          </button>
                        </div>
                    ))
                )}
              </div>
          )}

          {/* ABA: NOVO RELATÓRIO */}
          {modo === "novo" && (
              <>
                {rascunhoCarregado && (
                    <div style={{ marginBottom: 12 }}>
                      <div className="ieq-toast">
                        <CheckCircle2 size={15} />
                        RASCUNHO RESTAURADO — suas marcações anteriores foram recuperadas
                      </div>
                    </div>
                )}

                {/* Header */}
                <div style={{
                  padding: "40px 40px 36px", marginBottom: 24,
                  background: isDark ? "linear-gradient(135deg,#1A0A0D,#0A0608)" : `linear-gradient(135deg,${IEQ.blue},${IEQ.blueDark})`,
                  borderRadius: 14, position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-55deg,rgba(255,255,255,.03) 0 10px,transparent 10px 20px)", backgroundSize: "40px 40px" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="pulse-ring" style={{ width: 64, height: 64 }} />
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <QuadrangularCross size={28} />
                        </div>
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".22em", color: "rgba(255,255,255,.5)", margin: 0 }}>RELATÓRIO SEMANAL</p>
                        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: "4px 0 0", letterSpacing: ".1em" }}>
                          {nomeCelula.toUpperCase()}
                        </h1>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <UserCheck size={18} style={{ color: "#fff" }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: "rgba(255,255,255,.5)", margin: 0 }}>LÍDER RESPONSÁVEL</p>
                        <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{nomeUsuarioLider}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campos data + tema */}
                <div className="ieq-card" style={{ padding: "26px 28px", marginBottom: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="ieq-label"><Calendar size={11} style={{ display: "inline", marginRight: 6 }} />DATA DA REUNIÃO</label>
                      <input className="ieq-input" type="date" value={form.dataReuniao} onChange={e => setForm({ ...form, dataReuniao: e.target.value })} />
                    </div>
                    <div>
                      <SeletorReferenciaBiblica
                          value={form.estudo}
                          onChange={val => setForm({ ...form, estudo: val })}
                          isDark={isDark}
                      />
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "MEMBROS",    val: membrosPresentes,    color: IEQ.red },
                    { label: "VISITANTES", val: visitantesPresentes, color: IEQ.blue },
                    { label: "TOTAL",      val: total,               color: IEQ.yellow, highlight: true },
                  ].map(({ label, val, color, highlight }) => (
                      <div key={label} className="ieq-kpi" style={highlight ? { background: `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})`, border: "none" } : {}}>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: highlight ? "rgba(255,255,255,.6)" : ts, margin: "0 0 6px" }}>{label}</p>
                        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 38, fontWeight: 700, color: highlight ? "#fff" : color, margin: 0, lineHeight: 1 }}>{val}</p>
                      </div>
                  ))}
                </div>

                {/* Chamada */}
                <div className="ieq-card" style={{ overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"}`, display: "flex", alignItems: "center", gap: 10 }}>
                    <Users2 size={18} style={{ color: IEQ.red }} />
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: tp }}>CHAMADA</span>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".12em", color: ts, marginLeft: "auto" }}>{pessoas.length} PESSOAS</span>
                  </div>
                  <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
                    {pessoas.map((pessoa) => {
                      const marcado     = form.selecionadosKeys.includes(pessoa.uKey);
                      const isVisitante = pessoa.tipo === "VISITANTE";
                      const processing  = processingIds.has(pessoa.uKey);
                      return (
                          <div key={pessoa.uKey} className="ieq-person-row" style={{ background: marcado ? (isDark ? "rgba(200,16,46,.07)" : "rgba(200,16,46,.05)") : "transparent" }}>
                            <button
                                onClick={() => alternarPresenca(pessoa.uKey)}
                                disabled={processing}
                                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", transition: "all .2s" }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{
                                  width: 44, height: 44, borderRadius: 8,
                                  background: marcado ? `linear-gradient(135deg,${IEQ.redDark},${IEQ.blue})` : (isDark ? "rgba(255,255,255,.06)" : "rgba(200,16,46,.08)"),
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: marcado ? "#fff" : (isDark ? IEQ.offWhite : "#1A0A0D"),
                                  fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16,
                                  transition: "all .3s", transform: marcado ? "scale(1.05)" : "scale(1)",
                                }}>
                                  {processing ? <Loader2 size={18} className="spin-icon" /> : pessoa.nome.charAt(0)}
                                </div>
                                <div style={{ textAlign: "left" }}>
                                  <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, fontWeight: marcado ? 600 : 400, color: marcado ? tp : ts, margin: 0 }}>{pessoa.nome}</p>
                                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".15em", color: isVisitante ? IEQ.yellow : IEQ.red }}>{pessoa.tipo}</span>
                                </div>
                              </div>
                              <div style={{
                                width: 26, height: 26, borderRadius: 6,
                                border: `2px solid ${marcado ? IEQ.red : (isDark ? "rgba(200,16,46,.2)" : "rgba(200,16,46,.18)")}`,
                                background: marcado ? IEQ.red : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s",
                              }}>
                                {marcado && <CheckCircle2 size={14} style={{ color: "#fff" }} />}
                              </div>
                            </button>
                            {marcado && isVisitante && (
                                <div style={{ padding: "0 24px 18px 82px" }}>
                                  <div className="ieq-card" style={{ padding: "16px 18px" }}>
                                    <label className="ieq-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <Trophy size={11} /> DECISÃO ESPIRITUAL
                                    </label>
                                    <div style={{ position: "relative" }}>
                                      <select
                                          className="ieq-select"
                                          value={form.decisoes[pessoa.uKey] || "NENHUMA"}
                                          onChange={e => setForm(prev => ({ ...prev, decisoes: { ...prev.decisoes, [pessoa.uKey]: e.target.value } }))}
                                      >
                                        <option value="NENHUMA">Só visita</option>
                                        <option value="ACEITOU_JESUS">Aceitou Jesus</option>
                                        <option value="RECONCILIOU">Reconciliou</option>
                                        <option value="BATISMO_AGUAS">Deseja Batismo</option>
                                      </select>
                                      <ChevronDown size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: ts, pointerEvents: "none" }} />
                                    </div>
                                  </div>
                                </div>
                            )}
                          </div>
                      );
                    })}
                  </div>
                </div>
              </>
          )}
        </div>

        {/* Botão fixo — só aparece na aba novo */}
        {modo === "novo" && (
            <div style={{
              position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 24px", zIndex: 50,
              background: isDark ? "linear-gradient(to top,rgba(10,6,8,1) 60%,transparent)" : "linear-gradient(to top,rgba(240,234,232,1) 60%,transparent)",
            }}>
              <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <button
                    onClick={handleSubmit}
                    disabled={enviando || !form.estudo.trim()}
                    style={{
                      width: "100%", padding: "17px 0", borderRadius: 10, border: "none",
                      background: (enviando || !form.estudo.trim()) ? "rgba(200,16,46,.3)" : `linear-gradient(135deg,${IEQ.redDark},${IEQ.red})`,
                      color: "#fff", cursor: (enviando || !form.estudo.trim()) ? "not-allowed" : "pointer",
                      fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, letterSpacing: ".22em",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .25s",
                    }}
                >
                  {enviando
                      ? <><Loader2 size={17} className="spin-icon" /> ENVIANDO...</>
                      : <><ClipboardCheck size={17} /> FINALIZAR RELATÓRIO ({total})</>
                  }
                </button>
              </div>
            </div>
        )}
      </div>
  );
}
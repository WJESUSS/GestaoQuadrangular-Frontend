import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import {
  Loader2, Save, User, Calendar, Wallet,
  Trophy, AlertCircle, CheckCircle2,
} from "lucide-react";

/* ─── Tokens AURA ─────────────────────────────────────────────────── */
const AURA = {
  gold: "#C9A96E", goldLight: "#E8D5A3",
  red: "#C8102E",  redDark: "#9B0B1E",
  blue: "#003DA5", blueDark: "#002470",
};

function tk(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.97)"     : "rgba(255,255,255,.95)",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
    borderInput: isDark ? "rgba(201,169,110,.15)"  : "rgba(201,169,110,.28)",
    text:        isDark ? "#F5F0E8"                : "#1A1008",
    textSec:     isDark ? "#9A9588"                : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"                : "#9A9080",
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
    rowBg:       isDark ? "rgba(255,255,255,.025)" : "rgba(201,169,110,.04)",
    optionBg:    isDark ? "#12121A"                : "#F0EAE0",
  };
}

function GlobalStyles({ t, isDark }) {
  return (
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; }

      @keyframes tl-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @keyframes tl-zoomIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
      @keyframes tl-spin   { to{transform:rotate(360deg)} }
      @keyframes tl-blink  { 0%,100%{opacity:1} 50%{opacity:.3} }
      @keyframes tl-shine  { from{transform:translateX(-100%)} to{transform:translateX(100%)} }

      .tl-root { animation: tl-fadeUp .45s ease; }
      .tl-spin { animation: tl-spin 1s linear infinite; }

      /* ── Inputs ── */
      .tl-input {
        width: 100%;
        background: ${t.bgInput};
        border: 1px solid ${t.borderInput};
        color: ${t.text};
        padding: 13px 16px;
        border-radius: 13px; outline: none;
        font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
        transition: all .25s;
        appearance: none; -webkit-appearance: none;
      }
      .tl-input option { background: ${t.optionBg}; color: ${t.text}; }
      .tl-input:focus {
        border-color: rgba(201,169,110,.5);
        background: rgba(201,169,110,.04);
        box-shadow: 0 0 0 3px rgba(201,169,110,.08);
      }
      .tl-input::placeholder { color: ${t.placeholder}; }
      .tl-input[type="date"]::-webkit-calendar-picker-indicator {
        filter: ${isDark ? "invert(1) opacity(.35)" : "opacity(.35)"};
      }
      .tl-input-prefix { padding-left: 42px !important; }

      /* ── Tipo buttons ── */
      .tl-tipo-btn {
        flex: 1; padding: 11px 8px; border-radius: 10px; border: none;
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase; cursor: pointer;
        transition: all .25s;
      }
      .tl-tipo-btn.active {
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; box-shadow: 0 4px 16px rgba(200,16,46,.28);
      }
      .tl-tipo-btn.inactive {
        background: transparent; color: ${t.textMuted};
      }
      .tl-tipo-btn.inactive:hover {
        background: rgba(201,169,110,.08); color: ${AURA.gold};
      }

      /* ── Alert ── */
      .tl-alert {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 16px; border-radius: 13px;
        font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400;
        animation: tl-zoomIn .3s ease;
      }
      .tl-alert.error {
        background: rgba(200,16,46,.08);
        border: 1px solid rgba(200,16,46,.22);
        color: ${isDark ? "#F87171" : AURA.redDark};
      }
      .tl-alert.success {
        background: rgba(0,61,165,.08);
        border: 1px solid rgba(0,61,165,.22);
        color: ${isDark ? "#93C5FD" : AURA.blueDark};
      }

      /* ── Form grid ── */
      .tl-form-grid {
        display: grid; grid-template-columns: 1fr;
        gap: 18px; margin-bottom: 24px;
      }
      @media (min-width: 520px) {
        .tl-form-grid { grid-template-columns: repeat(2, 1fr); }
        .tl-full { grid-column: 1 / -1; }
      }

      /* ── Save button ── */
      .tl-btn-save {
        width: 100%; padding: 16px 24px; border: none; border-radius: 100px;
        cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
        font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
        letter-spacing: .16em; text-transform: uppercase;
        background: linear-gradient(135deg, ${AURA.redDark}, ${AURA.red});
        color: #fff; position: relative; overflow: hidden;
        transition: all .3s; box-shadow: 0 6px 22px rgba(200,16,46,.28);
      }
      .tl-btn-save:not(:disabled):hover {
        transform: translateY(-2px); box-shadow: 0 10px 30px rgba(200,16,46,.38);
      }
      .tl-btn-save:not(:disabled):hover::after {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent);
        animation: tl-shine .7s ease forwards;
      }
      .tl-btn-save:disabled {
        background: ${isDark ? "rgba(201,169,110,.08)" : "rgba(201,169,110,.12)"};
        color: ${t.textMuted}; cursor: not-allowed; box-shadow: none;
      }

      /* ── Label ── */
      .tl-label {
        display: flex; align-items: center; gap: 7px; margin-bottom: 8px;
        font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600;
        text-transform: uppercase; letter-spacing: .2em; color: ${t.textMuted};
      }

      /* ── Tipo bar ── */
      .tl-tipo-bar {
        display: flex; gap: 6px;
        background: ${isDark ? "rgba(255,255,255,.03)" : "rgba(201,169,110,.05)"};
        border: 1px solid ${t.border};
        padding: 5px; border-radius: 14px;
      }
    `}</style>
  );
}

export default function TesourariaLancamento({ isDark = false }) {
  const t = tk(isDark);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [form, setForm] = useState({
    membroNome: "", valorDizimo: "", valorOferta: "",
    tipoOferta: "BRONZE",
    dataLancamento: new Date().toISOString().split("T")[0],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const limpar = s => { const n = Number((s || "").replace(",", ".").trim()); return isNaN(n) ? 0 : n; };

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
    const vD = limpar(form.valorDizimo), vO = limpar(form.valorOferta);
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
      setForm({ membroNome: "", valorDizimo: "", valorOferta: "", tipoOferta: "BRONZE", dataLancamento: new Date().toISOString().split("T")[0] });
      setTimeout(() => setSucesso(false), 4000);
    } catch { setErro("Erro ao registrar lançamento no servidor."); }
    finally { setLoading(false); }
  };

  return (
      <>
        <GlobalStyles t={t} isDark={isDark} />
        <div className="tl-root" style={{ maxWidth: 680, margin: "0 auto", padding: "4px 0 24px" }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: 24 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(201,169,110,.07)", border: "1px solid rgba(201,169,110,.2)",
            borderRadius: 100, padding: "7px 16px",
            fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 600,
            letterSpacing: ".14em", textTransform: "uppercase", color: AURA.gold,
            marginBottom: 12,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: AURA.gold, display: "inline-block", animation: "tl-blink 2s ease-in-out infinite" }} />
            Registro de entrada
          </span>
            <h2 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(1.5rem,4vw,2rem)",
              fontWeight: 500, color: t.text,
              margin: 0, letterSpacing: ".02em",
            }}>
              Lançamento
            </h2>
          </div>

          {/* ── Divider ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,transparent,${AURA.gold})` }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: AURA.gold }} />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left,transparent,${AURA.gold})` }} />
          </div>

          {/* ── Card ── */}
          <div style={{
            background: t.bgEl, border: `1px solid ${t.border}`,
            borderRadius: 20, padding: "24px 20px",
            backdropFilter: "blur(24px)", position: "relative", overflow: "hidden",
          }}>
            {/* linha dourada topo */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg,transparent,rgba(201,169,110,.2),transparent)",
            }} />

            {/* Feedbacks */}
            {erro    && <div className="tl-alert error"   style={{ marginBottom: 18 }}><AlertCircle  size={16} />{erro}</div>}
            {sucesso && <div className="tl-alert success" style={{ marginBottom: 18 }}><CheckCircle2 size={16} />Lançamento registrado com sucesso!</div>}

            <div className="tl-form-grid">

              {/* Membro */}
              <div className="tl-full">
                <label className="tl-label"><User size={11} /> Membro responsável</label>
                <select className="tl-input" value={form.membroNome} onChange={e => set("membroNome", e.target.value)}>
                  <option value="">Selecione na lista…</option>
                  {membros.map((m, i) => <option key={i} value={m.nome}>{m.nome}</option>)}
                </select>
              </div>

              {/* Data */}
              <div>
                <label className="tl-label"><Calendar size={11} /> Data do evento</label>
                <input type="date" className="tl-input" value={form.dataLancamento} onChange={e => set("dataLancamento", e.target.value)} />
              </div>

              {/* Dízimo */}
              <div>
                <label className="tl-label"><Wallet size={11} /> Valor dízimo</label>
                <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500,
                  color: t.textMuted, pointerEvents: "none",
                }}>R$</span>
                  <input type="text" className="tl-input tl-input-prefix" placeholder="0,00"
                         value={form.valorDizimo} onChange={e => set("valorDizimo", e.target.value)} />
                </div>
              </div>

              {/* Oferta */}
              <div>
                <label className="tl-label"><Trophy size={11} /> Valor oferta</label>
                <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500,
                  color: t.textMuted, pointerEvents: "none",
                }}>R$</span>
                  <input type="text" className="tl-input tl-input-prefix" placeholder="0,00"
                         value={form.valorOferta} onChange={e => set("valorOferta", e.target.value)} />
                </div>
              </div>

              {/* Tipo */}
              <div className="tl-full">
                <label className="tl-label">Categoria especial</label>
                <div className="tl-tipo-bar">
                  {["BRONZE", "PRATA", "OURO"].map(tipo => (
                      <button key={tipo} className={`tl-tipo-btn ${form.tipoOferta === tipo ? "active" : "inactive"}`}
                              onClick={() => set("tipoOferta", tipo)}>
                        {tipo}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="tl-btn-save" onClick={handleSalvar} disabled={loading}>
              {loading
                  ? <Loader2 size={18} className="tl-spin" />
                  : <><Save size={15} /> Confirmar lançamento</>
              }
            </button>
          </div>

          {/* Footer */}
          <p style={{
            textAlign: "center", marginTop: 20,
            fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 500,
            letterSpacing: ".18em", textTransform: "uppercase",
            color: isDark ? "rgba(245,240,232,.12)" : "rgba(26,16,8,.15)",
          }}>
            © {new Date().getFullYear()} IEQ Pituaçu · Sistema Eclesiástico
          </p>
        </div>
      </>
  );
}
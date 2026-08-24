import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  User, Clock, Search, FileText, ChevronLeft, ChevronRight,
} from "lucide-react";

const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  dark:      "#0A0A0F",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  blueDark:  "#002470",
  green:     "#059669",
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
    placeholder: isDark ? "rgba(154,149,136,.35)"  : "rgba(107,94,74,.35)",
    optionBg:    isDark ? "#12121A"                : "#F0EAE0",
  };
}

export default function AprovacaoFichasMembro({ isDark }) {
  const t = theme(isDark);
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [busca, setBusca] = useState("");
  const [detalhe, setDetalhe] = useState(null);
  const [rejeitando, setRejeitando] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const ok = msg => { setSucesso(msg); setTimeout(() => setSucesso(""), 3500); };

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/solicitacoes-ficha/pendentes", { params: { page, size: 10 } });
      setFichas(r.data?.content || []);
      setTotalPages(r.data?.totalPages || 0);
    } catch { setErro("Erro ao carregar solicitações."); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { carregar(); }, [carregar]);

  const decidir = async (id, aprovado) => {
    const payload = { aprovado };
    if (!aprovado) {
      if (!motivoRejeicao.trim()) { setErro("Informe o motivo da rejeição."); return; }
      payload.motivoRejeicao = motivoRejeicao;
    }
    setActionId(id);
    try {
      await api.patch(`/solicitacoes-ficha/${id}/decidir`, payload);
      ok(aprovado ? "Membro cadastrado com sucesso!" : "Solicitação rejeitada.");
      window.dispatchEvent(new Event("solicitacoes:updated"));
      setRejeitando(null);
      setMotivoRejeicao("");
      setDetalhe(null);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao processar decisão.");
    } finally { setActionId(null); }
  };

  const pendentes = fichas.filter(f => f.status === "PENDENTE").length;

  const filtradas = busca
    ? fichas.filter(f => f.nome?.toLowerCase().includes(busca.toLowerCase()))
    : fichas;

  const statusBadge = (s) => {
    const map = {
      PENDENTE: { color: "#D97706", bg: "rgba(217,119,6,.1)", label: "Pendente" },
      APROVADO: { color: "#059669", bg: "rgba(5,150,105,.1)", label: "Aprovado" },
      REJEITADO: { color: "#DC2626", bg: "rgba(220,38,38,.1)", label: "Rejeitado" },
    };
    const c = map[s] || map.PENDENTE;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: ".07em", color: c.color, background: c.bg, border: `1px solid ${c.color}30`, whiteSpace: "nowrap" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} /> {c.label}
      </span>
    );
  };

  const verDetalhe = async (id) => {
    try {
      const r = await api.get(`/solicitacoes-ficha/${id}`);
      setDetalhe(r.data);
    } catch { setErro("Erro ao buscar detalhes."); }
  };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: t.text, maxWidth: 900, margin: "0 auto", padding: "0 0 40px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600&family=Inter:wght@300;400;500;600&display=swap');`}</style>

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

      {/* Detalhe Modal */}
      <AnimatePresence>
        {detalhe && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            onClick={e => e.target === e.currentTarget && setDetalhe(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{ width: "100%", maxWidth: 500, maxHeight: "85vh", display: "flex", flexDirection: "column", borderRadius: "20px 20px 0 0", background: t.bgEl, border: `1px solid ${t.border}`, overflow: "hidden" }}
            >
              <div style={{ padding: "20px 22px", overflow: "auto", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>Detalhes da Solicitação</h3>
                  <button onClick={() => { setDetalhe(null); setRejeitando(null); setMotivoRejeicao(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, display: "flex" }}>
                    <XCircle size={18} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><strong style={{ fontSize: 12, color: t.textMuted }}>Nome:</strong> <span style={{ fontSize: 14, color: t.text }}>{detalhe.nome}</span></div>
                  {detalhe.telefone && <div><strong style={{ fontSize: 12, color: t.textMuted }}>Telefone:</strong> <span style={{ fontSize: 14, color: t.text }}>{detalhe.telefone}</span></div>}
                  {detalhe.email && <div><strong style={{ fontSize: 12, color: t.textMuted }}>E-mail:</strong> <span style={{ fontSize: 14, color: t.text }}>{detalhe.email}</span></div>}
                  {detalhe.cpf && <div><strong style={{ fontSize: 12, color: t.textMuted }}>CPF:</strong> <span style={{ fontSize: 14, color: t.text }}>{detalhe.cpf}</span></div>}
                  {detalhe.rg && <div><strong style={{ fontSize: 12, color: t.textMuted }}>RG:</strong> <span style={{ fontSize: 14, color: t.text }}>{detalhe.rg}</span></div>}
                  <div><strong style={{ fontSize: 12, color: t.textMuted }}>Líder:</strong> <span style={{ fontSize: 14, color: t.text }}>{detalhe.liderNome}</span></div>
                  {detalhe.celulaDescricao && <div><strong style={{ fontSize: 12, color: t.textMuted }}>Célula:</strong> <span style={{ fontSize: 14, color: t.text }}>{detalhe.celulaDescricao}</span></div>}
                  <div><strong style={{ fontSize: 12, color: t.textMuted }}>Data:</strong> <span style={{ fontSize: 14, color: t.text }}>{new Date(detalhe.dataSolicitacao).toLocaleString("pt-BR")}</span></div>
                  <div>{statusBadge(detalhe.status)}</div>

                  {detalhe.status === "REJEITADO" && detalhe.motivoRejeicao && (
                    <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,.06)", border: "1px solid rgba(220,38,38,.15)" }}>
                      <strong style={{ fontSize: 11, color: "#DC2626" }}>Motivo da rejeição:</strong>
                      <p style={{ fontSize: 13, color: t.text, margin: "4px 0 0" }}>{detalhe.motivoRejeicao}</p>
                    </div>
                  )}

                  {detalhe.status === "APROVADO" && detalhe.membroCriadoId && (
                    <div style={{ padding: 10, borderRadius: 8, background: "rgba(5,150,105,.06)", border: "1px solid rgba(5,150,105,.15)" }}>
                      <strong style={{ fontSize: 11, color: "#059669" }}>Membro criado (ID: {detalhe.membroCriadoId})</strong>
                    </div>
                  )}
                </div>

                {detalhe.status === "PENDENTE" && (
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    {rejeitando === detalhe.id ? (
                      <>
                        <textarea
                          value={motivoRejeicao}
                          onChange={e => setMotivoRejeicao(e.target.value)}
                          placeholder="Motivo da rejeição (obrigatório)..."
                          rows={3}
                          style={{ width: "100%", background: t.bgInput, border: `1px solid ${t.borderInput}`, color: t.text, padding: 12, borderRadius: 10, outline: "none", fontFamily: "inherit", fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { setRejeitando(null); setMotivoRejeicao(""); }} style={{ flex: 1, padding: "12px", borderRadius: 100, border: `1px solid ${t.border}`, background: "transparent", color: t.textSec, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase" }}>
                            Cancelar
                          </button>
                          <button onClick={() => decidir(detalhe.id, false)} disabled={actionId === detalhe.id} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", border: "none", borderRadius: 100, cursor: "pointer", background: "#DC2626", color: "#fff", fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", opacity: actionId === detalhe.id ? .6 : 1 }}>
                            {actionId === detalhe.id ? <><Loader2 size={13} style={{ animation: "dl-spin 1s linear infinite" }} /> Rejeitando...</> : <><XCircle size={13} /> Confirmar Rejeição</>}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => decidir(detalhe.id, true)} disabled={actionId === detalhe.id} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", border: "none", borderRadius: 100, cursor: "pointer", background: `linear-gradient(135deg,#059669,#047857)`, color: "#fff", fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", opacity: actionId === detalhe.id ? .6 : 1 }}>
                          {actionId === detalhe.id ? <><Loader2 size={13} style={{ animation: "dl-spin 1s linear infinite" }} /> Aprovando...</> : <><CheckCircle2 size={13} /> Aprovar</>}
                        </button>
                        <button onClick={() => setRejeitando(detalhe.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", border: "none", borderRadius: 100, cursor: "pointer", background: "rgba(220,38,38,.1)", color: "#DC2626", fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
                          <XCircle size={13} /> Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".25em", textTransform: "uppercase", color: "rgba(201,169,110,.6)", marginBottom: 4 }}>Secretaria</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(18px,4vw,24px)", fontWeight: 500, color: t.text, margin: 0, letterSpacing: ".02em" }}>
            Solicitações de Ficha
          </h2>
        </div>
        <button onClick={() => { carregar(); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100, border: `1px solid ${t.border}`, background: "transparent", color: t.textSec, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>
          <RefreshCw size={12} style={{ animation: loading ? "dl-spin 1s linear infinite" : "none" }} /> Atualizar
        </button>
      </div>

      {/* Busca */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }} />
        <input
          placeholder="Buscar por nome..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ width: "100%", background: t.bgInput, border: `1px solid ${t.borderInput}`, color: t.text, padding: "12px 16px 12px 44px", borderRadius: 12, outline: "none", fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" }}
          onFocus={e => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(201,169,110,.12)`; }}
          onBlur={e => { e.currentTarget.style.borderColor = t.borderInput; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={28} style={{ animation: "dl-spin 1s linear infinite", color: AURA.gold }} /></div>
      ) : filtradas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: .3 }}><FileText size={48} /></div>
          <p style={{ fontSize: 14, color: t.textMuted, fontStyle: "italic" }}>Nenhuma solicitação pendente.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtradas.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * .03 }}
              style={{
                background: t.bgEl, border: `1px solid ${f.status === "PENDENTE" ? "rgba(217,119,6,.25)" : t.border}`,
                borderRadius: 14, overflow: "hidden",
                borderLeft: f.status === "PENDENTE" ? `3px solid #D97706` : `3px solid transparent`,
              }}
            >
              <div style={{ padding: "14px 16px", cursor: "pointer" }} onClick={() => verDetalhe(f.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(201,169,110,.1)", color: AURA.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nome}</p>
                    <p style={{ fontSize: 10, color: t.textMuted, margin: "2px 0 0" }}>
                      {f.liderNome && `Líder: ${f.liderNome}`} {f.celulaDescricao && `· ${f.celulaDescricao}`} · {new Date(f.dataSolicitacao).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  {statusBadge(f.status)}
                </div>
              </div>

              {f.status === "PENDENTE" && (
                <div style={{ padding: "8px 16px 14px", display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setDetalhe(null); decidir(f.id, true); }}
                    disabled={actionId === f.id}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", border: "none", borderRadius: 100, cursor: "pointer", background: "rgba(5,150,105,.1)", color: "#059669", fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", opacity: actionId === f.id ? .5 : 1 }}
                  >
                    {actionId === f.id ? <Loader2 size={12} style={{ animation: "dl-spin 1s linear infinite" }} /> : <CheckCircle2 size={12} />} Aprovar
                  </button>
                  <button
                    onClick={() => { verDetalhe(f.id); setRejeitando(f.id); }}
                    disabled={actionId === f.id}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", border: "none", borderRadius: 100, cursor: "pointer", background: "rgba(220,38,38,.06)", color: "#DC2626", fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", opacity: actionId === f.id ? .5 : 1 }}
                  >
                    <XCircle size={12} /> Rejeitar
                  </button>
                </div>
              )}
            </motion.div>
          ))}
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

      <style>{`
        @keyframes dl-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

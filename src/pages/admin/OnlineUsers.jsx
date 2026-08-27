import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { getFotoUrl } from "../../utils/foto.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, WifiOff, Sun, Moon, LogOut, ArrowLeft,
  Users, Loader2, RefreshCcw, Clock,
} from "lucide-react";

const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  red:       "#C8102E",
  blue:      "#003DA5",
  green:     "#059669",
};

function theme(isDark) {
  return {
    bg:          isDark ? "#0A0A0F"               : "#F5F0E8",
    bgEl:        isDark ? "rgba(18,18,26,.98)"     : "rgba(255,255,255,.98)",
    bgInput:     isDark ? "rgba(255,255,255,.04)"  : "rgba(0,0,0,.04)",
    border:      isDark ? "rgba(201,169,110,.1)"   : "rgba(201,169,110,.2)",
    text:        isDark ? "#F5F0E8"                : "#1A1008",
    textSec:     isDark ? "#9A9588"                : "#6B5E4A",
    textMuted:   isDark ? "#6B6658"                : "#9A9080",
    glow1:       isDark ? "rgba(201,169,110,.05)"  : "rgba(201,169,110,.08)",
    glow2:       isDark ? "rgba(201,169,110,.04)"  : "rgba(201,169,110,.06)",
    headerBg:    isDark ? "rgba(10,10,15,.97)"     : "rgba(245,240,232,.97)",
  };
}

function perfilLabel(perfil) {
  const map = {
    ADMIN: "Administrador",
    PASTOR: "Pastor",
    SECRETARIO: "Secretário",
    LIDER_CELULA: "Líder de Célula",
    TESOUREIRO: "Tesoureiro",
    DIACONO: "Diácono",
  };
  return map[perfil] || perfil || "—";
}

function perfilCor(perfil) {
  const map = {
    ADMIN: AURA.red,
    PASTOR: AURA.blue,
    SECRETARIO: "#7C3AED",
    LIDER_CELULA: AURA.green,
    TESOUREIRO: AURA.gold,
    DIACONO: "#0EA5E9",
  };
  return map[perfil] || AURA.gold;
}

function tempoDecorrido(iso) {
  if (!iso) return "—";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const seg = Math.floor(diff / 1000);
    if (seg < 60) return "agora";
    const min = Math.floor(seg / 60);
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h${min % 60 ? ` ${min % 60}min` : ""}`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  } catch {
    return "—";
  }
}

export default function OnlineUsers() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [total, setTotal] = useState(0);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const intervalRef = useRef(null);

  const t = theme(isDark);

  const buscarOnline = useCallback(async () => {
    try {
      const { data } = await api.get("presenca/online");
      setTotal(data.total || 0);
      setUsuarios(Array.isArray(data.usuarios) ? data.usuarios : []);
      setErro("");
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao carregar usuários online.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarOnline();
    intervalRef.current = setInterval(buscarOnline, 15000);
    return () => clearInterval(intervalRef.current);
  }, [buscarOnline]);

  useEffect(() => { localStorage.setItem("theme", isDark ? "dark" : "light"); }, [isDark]);

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  return (
      <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Inter',sans-serif", color: t.text }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
          .ou-card { background:${t.bgEl}; border:1px solid ${t.border}; border-radius:18px; overflow:hidden; }
          .ou-header { padding:20px 22px; border-bottom:1px solid ${t.border}; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
          .ou-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:500; color:${t.text}; margin:0; }
          .ou-sub { font-size:11px; color:${t.textMuted}; margin:2px 0 0; }
          .ou-kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:20px 22px; }
          @media(max-width:480px){ .ou-kpi-grid{ grid-template-columns:1fr; gap:8px; margin:14px; } }
          .ou-kpi { background:${t.bgEl}; border:1px solid ${t.border}; border-radius:14px; padding:16px; display:flex; align-items:center; gap:14px; }
          .ou-kpi-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
          .ou-kpi-num { font-family:'Playfair Display',serif; font-size:24px; font-weight:600; color:${t.text}; margin:0; }
          .ou-kpi-lbl { font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:${t.textMuted}; margin:2px 0 0; }
          .ou-list { padding:12px 22px 22px; display:flex; flex-direction:column; gap:8px; }
          @media(max-width:480px){ .ou-list{ padding:12px 14px 18px; } }
          .ou-row { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:13px; background:${isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)"}; border:1px solid ${t.border}; transition:border-color .2s; }
          .ou-row:hover { border-color:${AURA.gold}; }
          .ou-avatar { width:38px; height:38px; border-radius:10px; flex-shrink:0; overflow:hidden; background:linear-gradient(135deg,rgba(201,169,110,.18),rgba(201,169,110,.06)); border:1px solid rgba(201,169,110,.2); display:flex; align-items:center; justify-content:center; }
          .ou-avatar img { width:100%; height:100%; object-fit:cover; border-radius:10px; }
          .ou-avatar-initial { font-family:'Playfair Display',serif; font-weight:600; font-size:15px; color:${AURA.gold}; }
          .ou-name { font-size:13px; font-weight:500; color:${t.text}; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .ou-email { font-size:11px; color:${t.textMuted}; margin:1px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .ou-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px; font-size:9px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
          .ou-time { font-size:10px; color:${t.textMuted}; white-space:nowrap; flex-shrink:0; display:flex; align-items:center; gap:4px; }
          .ou-btn { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px; border:1px solid ${t.border}; background:transparent; color:${t.textMuted}; cursor:pointer; transition:all .2s; flex-shrink:0; }
          .ou-btn:hover { border-color:${AURA.gold}; color:${AURA.gold}; }
          .ou-empty { text-align:center; padding:40px 20px; }
          .ou-spinner { width:40px; height:40px; border-radius:50%; border:2.5px solid ${t.border}; border-top-color:${AURA.gold}; animation:ou-spin .8s linear infinite; margin:0 auto 16px; }
          @keyframes ou-spin { to { transform:rotate(360deg); } }
          .ou-live-dot { width:7px; height:7px; border-radius:50%; background:${AURA.green}; animation:ou-pulse 2s ease-in-out infinite; flex-shrink:0; }
          @keyframes ou-pulse { 0%,100%{ opacity:1; } 50%{ opacity:.4; } }
          .ou-content { max-width:720px; margin:0 auto; padding:24px 18px 40px; }
          @media(max-width:480px){ .ou-content{ padding:16px 12px 32px; } }
        `}</style>

        {/* Header */}
        <div style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <button className="ou-btn" onClick={() => navigate(-1)} title="Voltar">
                <ArrowLeft size={16} />
              </button>
              <div style={{ minWidth: 0 }}>
                <p className="ou-title">Usuários Online</p>
                <p className="ou-sub">Quem está conectado agora</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="ou-live-dot" />
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: AURA.green }}>
                  {total} online
                </span>
              </div>
              <button className="ou-btn" onClick={() => setIsDark(!isDark)} title="Tema">
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button className="ou-btn" onClick={buscarOnline} title="Atualizar">
                <RefreshCcw size={14} style={{ animation: loading ? "ou-spin .8s linear infinite" : "none" }} />
              </button>
              <button className="ou-btn" onClick={handleLogout} title="Sair">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="ou-content">
          {/* KPIs */}
          <div className="ou-kpi-grid">
            <div className="ou-kpi">
              <div className="ou-kpi-icon" style={{ background: "rgba(5,150,105,.1)", color: AURA.green }}>
                <Wifi size={18} />
              </div>
              <div>
                <p className="ou-kpi-num">{loading ? "…" : total}</p>
                <p className="ou-kpi-lbl">Online agora</p>
              </div>
            </div>
            <div className="ou-kpi">
              <div className="ou-kpi-icon" style={{ background: "rgba(0,61,165,.1)", color: AURA.blue }}>
                <Users size={18} />
              </div>
              <div>
                <p className="ou-kpi-num">{loading ? "…" : usuarios.length}</p>
                <p className="ou-kpi-lbl">Total listados</p>
              </div>
            </div>
            <div className="ou-kpi">
              <div className="ou-kpi-icon" style={{ background: "rgba(201,169,110,.1)", color: AURA.gold }}>
                <Clock size={18} />
              </div>
              <div>
                <p className="ou-kpi-num" style={{ fontSize: 14 }}>
                  {loading ? "…" : usuarios.length > 0 ? tempoDecorrido(usuarios[0]?.ultimoHeartbeat) : "—"}
                </p>
                <p className="ou-kpi-lbl">Último heartbeat</p>
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="ou-card">
            <div className="ou-header">
              <div>
                <p className="ou-title" style={{ fontSize: 15 }}>Usuários conectados</p>
                <p className="ou-sub">Atualiza a cada 15 segundos</p>
              </div>
              <button className="ou-btn" onClick={buscarOnline} title="Atualizar agora">
                <RefreshCcw size={14} />
              </button>
            </div>

            <div className="ou-list">
              {loading && usuarios.length === 0 ? (
                  <div className="ou-empty">
                    <div className="ou-spinner" />
                    <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Carregando…</p>
                  </div>
              ) : erro ? (
                  <div className="ou-empty">
                    <WifiOff size={28} style={{ color: AURA.red, opacity: .6, marginBottom: 12 }} />
                    <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>{erro}</p>
                  </div>
              ) : usuarios.length === 0 ? (
                  <div className="ou-empty">
                    <WifiOff size={28} style={{ color: t.textMuted, opacity: .4, marginBottom: 12 }} />
                    <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Nenhum usuário online no momento.</p>
                  </div>
              ) : (
                  <AnimatePresence>
                    {usuarios.map((u, i) => (
                        <motion.div
                            key={u.id}
                            className="ou-row"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: .2, delay: i * .03 }}
                        >
                          <div className="ou-avatar">
                            {u.fotoPerfil
                                ? <img src={getFotoUrl(u.fotoPerfil)} alt={u.nome} />
                                : <span className="ou-avatar-initial">{u.nome?.charAt(0)?.toUpperCase() || "?"}</span>
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="ou-name">{u.nome || "—"}</p>
                            <p className="ou-email">{u.email || "—"}</p>
                          </div>
                          <span
                              className="ou-badge"
                              style={{
                                background: `${perfilCor(u.perfil)}14`,
                                color: perfilCor(u.perfil),
                                border: `1px solid ${perfilCor(u.perfil)}30`,
                              }}
                          >
                            {perfilLabel(u.perfil)}
                          </span>
                          <span className="ou-time">
                            <Clock size={10} />
                            {tempoDecorrido(u.ultimoHeartbeat)}
                          </span>
                        </motion.div>
                    ))}
                  </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

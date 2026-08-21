import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getFotoUrl } from "../utils/foto.js";

/* ─── Tokens AURA (espelhados das páginas Pastor/Secretaria) ─────────── */
const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  red:       "#C8102E",
  redDark:   "#9B0B1E",
  blue:      "#003DA5",
  blueDark:  "#002470",
  yellow:    "#FDB813",
};

function theme(isDark) {
  return {
    bgEl:      isDark ? "rgba(18,18,26,.97)"    : "rgba(232,241,251,.97)",
    border:    isDark ? "rgba(201,169,110,.14)" : "rgba(0,61,165,.16)",
    text:      isDark ? "#FFFFFF"               : "#0A1628",
    textSec:   isDark ? "#9A9588"               : "#1E3A5F",
    textMuted: isDark ? "#6B6658"               : "#4A6585",
  };
}

/* ─── Detecta gênero pelo cargo (ex: "Pastora", "Secretária") ─── */
function isFeminino(cargo) {
  if (!cargo) return false;
  const c = cargo.trim().toLowerCase();
  return c.endsWith("a") || c.endsWith("ã") || c.includes("secretária");
}

/* ─── Modal de boas-vindas (Pastor / Secretaria) ──────────────────────── */
export default function BoasVindas({ usuarioLogado, cargo = "", isDark, onClose }) {
  const t = theme(isDark);
  const feminino = isFeminino(cargo);

  return (
      <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: isDark ? "rgba(10,10,15,.94)" : "rgba(0,0,0,.82)",
            zIndex: 999, overflowY: "auto",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            padding: "40px 20px",
          }}
      >
        {/* ── imagem de fundo decorativa ── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: -1,
          backgroundImage: "url(/40dias-milagres.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(30px) brightness(.5) saturate(1.1)",
          transform: "scale(1.15)",
          pointerEvents: "none",
        }} />

        <motion.div
            initial={{ opacity: 0, scale: .88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .88, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: t.bgEl, borderRadius: 24,
              border: `1px solid ${t.border}`,
              padding: "40px 32px",
              maxWidth: 480, width: "100%",
              boxShadow: `0 24px 64px rgba(0,0,0,${isDark ? ".4" : ".18"})`,
              position: "relative", textAlign: "center",
              fontFamily: "'Inter',sans-serif",
            }}
        >
          {/* Faixa topo */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            borderRadius: "24px 24px 0 0",
            background: `linear-gradient(90deg,${AURA.redDark},${AURA.red},${AURA.yellow},${AURA.blue})`,
          }} />

          {/* Fechar */}
          <button onClick={onClose} aria-label="Fechar" style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", cursor: "pointer",
            color: t.textMuted, padding: 8, borderRadius: 8, display: "flex",
            transition: "all .2s",
          }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,.08)" : "rgba(200,16,46,.08)"; e.currentTarget.style.color = AURA.red; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = t.textMuted; }}>
            <X size={20} />
          </button>

          {/* Avatar com anéis pulsantes */}
          <motion.div
              initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: .1, type: "spring", damping: 18 }}
              style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ position: "absolute", width: 96, height: 96, borderRadius: "50%",
              border: "1px solid rgba(201,169,110,.25)", animation: "bv-pulse 3.2s ease-in-out infinite" }} />
            <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%",
              border: "1px solid rgba(201,169,110,.18)", animation: "bv-pulse 3.2s ease-in-out infinite", animationDelay: ".9s" }} />
            <div style={{
              width: 68, height: 68, borderRadius: "50%", overflow: "hidden",
              border: "1.5px solid rgba(201,169,110,.35)",
              background: isDark ? "rgba(18,18,26,.99)" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", zIndex: 1,
            }}>
              {usuarioLogado?.fotoPerfil ? (
                  <img src={getFotoUrl(usuarioLogado.fotoPerfil)} alt={usuarioLogado?.nome || cargo}
                       decoding="async"
                       style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 600, color: AURA.gold }}>
                {(usuarioLogado?.nome || cargo || "?").charAt(0).toUpperCase()}
              </span>
              )}
            </div>
          </motion.div>

          {/* Saudação + nome */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>
            <h1 style={{
              fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,5vw,28px)",
              fontWeight: 600, letterSpacing: ".04em",
              background: `linear-gradient(90deg,${AURA.redDark},${AURA.red},${AURA.yellow},${AURA.blue})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              margin: "0 0 12px",
            }}>
              Seja bem-vind{feminino ? "a" : "o"}{cargo ? `, ${cargo}` : ""}!
            </h1>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 500, color: t.text, margin: 0 }}>
              {usuarioLogado?.nome || cargo || "Usuário"}
            </p>
          </motion.div>

          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${t.border},transparent)`, margin: "26px 0" }} />

          {/* ── Imagem pequena de destaque ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}
                      style={{ display: "flex", justifyContent: "center" }}>
            <img
                src="/40dias-milagres.png"
                alt="40 Dias de Milagres — Avante e Sem Parar"
                style={{
                  width: 400, height: "auto", borderRadius: 14,
                  border: `1px solid ${t.border}`,
                  boxShadow: `0 8px 24px rgba(0,0,0,${isDark ? ".35" : ".15"})`,
                }}
            />
          </motion.div>

          {/* CTA */}
          <button onClick={onClose} style={{
            width: "100%", marginTop: 24,
            fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600,
            letterSpacing: ".16em", textTransform: "uppercase",
            background: `linear-gradient(135deg,${AURA.blue},${AURA.blueDark})`, color: "#fff",
            border: "none", borderRadius: 14, padding: "15px 20px",
            cursor: "pointer", transition: "all .25s",
            boxShadow: "0 6px 24px rgba(0,61,165,.25)",
          }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.filter = "brightness(1.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "brightness(1)"; }}>
            Entendido! Vamos começar
          </button>

          <style>{`@keyframes bv-pulse { 0%,100%{opacity:.25;transform:scale(1);} 50%{opacity:.06;transform:scale(1.1);} }`}</style>
        </motion.div>
      </motion.div>
  );
}
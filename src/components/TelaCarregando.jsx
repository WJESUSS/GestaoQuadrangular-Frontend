import React from "react";
import { Shield } from "lucide-react";

const AURA = {
  gold: "#C9A96E",
  redDark: "#9B0B1E",
};

/* Mesmo loader da tela AdminUsers: anel cônico giratório + núcleo pulsante com ícone */
export default function TelaCarregando({
  isDark = true,
  texto = "Carregando…",
  Icone = Shield,
  iconeSize = 20,
  tamanho = 76,
  minHeight = "100vh",
  background,
}) {
  return (
    <div style={{
      minHeight,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: background || (isDark ? "#080810" : "#F2EDE4"),
    }}>
      <style>{`
        @keyframes adm-loader-spin  { to { transform: rotate(360deg); } }
        @keyframes adm-loader-pulse { 0%,100%{ opacity:.55; transform:scale(1); } 50%{ opacity:1; transform:scale(1.05); } }
        @keyframes adm-loader-fade  { 0%,100%{ opacity:.35; } 50%{ opacity:1; } }
      `}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ position: "relative", width: tamanho, height: tamanho, margin: "0 auto 24px" }}>
          {/* Anel externo giratório com gradiente */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `conic-gradient(from 0deg, transparent 0deg, ${AURA.gold} 90deg, #C8102E 200deg, transparent 360deg)`,
            animation: "adm-loader-spin 1.3s linear infinite",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
          }} />
          {/* Trilho fixo sutil, por baixo */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `1px solid ${isDark ? "rgba(201,169,110,.1)" : "rgba(201,169,110,.18)"}`,
          }} />
          {/* Núcleo com o ícone, pulsando suavemente */}
          <div style={{
            position: "absolute", inset: 11, borderRadius: "50%",
            background: isDark ? "#0C0C14" : "#FBF8F1",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "adm-loader-pulse 2.4s ease-in-out infinite",
            boxShadow: isDark ? "0 0 22px rgba(201,169,110,.14)" : "0 0 20px rgba(201,169,110,.2)",
          }}>
            <Icone size={iconeSize} style={{ color: AURA.gold }} />
          </div>
        </div>
        <p style={{
          fontFamily: "'Inter',sans-serif", fontWeight: 600, letterSpacing: ".24em", fontSize: 9,
          color: isDark ? AURA.gold : AURA.redDark, textTransform: "uppercase", margin: 0,
          animation: "adm-loader-fade 1.8s ease-in-out infinite",
        }}>{texto}</p>
      </div>
    </div>
  );
}

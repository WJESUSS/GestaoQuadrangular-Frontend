import React, { useEffect, useState } from "react";
import { Download, Share, X, PlusSquare } from "lucide-react";

const DISMISS_KEY = "pwa-install-banner-dismissed-at";
const DISMISS_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const AURA = {
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  blue:      "#003DA5",
  blueDark:  "#002470",
  dark:      "#12121A",
};

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

/* Detectar o motor do navegador: Safari iOS usa WebKit. Chrome/Firefox/Edge
   no iOS "embrulham" mas mantêm identificadores próprios na userAgent. */
function isSafari() {
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edgios|opios|opr/i.test(ua);
}

export default function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mode, setMode] = useState(null); // "ios-safari" | "ios-other" | "a2hs" | null

  /* ── Detecção de plataforma + máquina de estados ─────────────────── */
  useEffect(() => {
    if (isStandalone()) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * DAY_MS) return;

    if (isIOS()) {
      setMode(isSafari() ? "ios-safari" : "ios-other");
      return;
    }

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setMode("a2hs");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  /* ── Dismiss com persistência de 7 dias ──────────────────────────── */
  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setMode(null);
    setDeferredPrompt(null);
  };

  /* ── Dispara o prompt de instalação ──────────────────────────────── */
  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setMode(null);
    }
    setDeferredPrompt(null);
  };

  if (!mode) return null;

  return (
      <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 0,
            width: "100%",
            maxWidth: 560,
            transform: "translateX(-50%)",
            zIndex: 9999,
            padding: "12px 16px",
            paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
            pointerEvents: "none",
          }}
      >
        <div
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 14px",
              borderRadius: 18,
              background: "rgba(14,14,22,.92)",
              backdropFilter: "blur(18px) saturate(140%)",
              WebkitBackdropFilter: "blur(18px) saturate(140%)",
              border: "1px solid rgba(201,169,110,.25)",
              boxShadow: "0 18px 50px rgba(0,0,0,.45), 0 0 0 1px rgba(201,169,110,.05)",
            }}
        >
          <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                flexShrink: 0,
                background: `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: AURA.goldLight,
              }}
          >
            <Download size={18} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {mode === "a2hs" ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: AURA.goldLight, margin: "0 0 3px" }}>
                    Instalar o aplicativo
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: "rgba(245,240,232,.7)", margin: 0, lineHeight: 1.5 }}>
                    Acesse a IEQ Pituaçu mais rápido, direto da sua tela inicial.
                  </p>
                  <button
                      onClick={install}
                      style={{
                        marginTop: 10,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "0 16px",
                        height: 34,
                        borderRadius: 100,
                        border: "none",
                        cursor: "pointer",
                        background: `linear-gradient(135deg, ${AURA.blueDark}, ${AURA.blue})`,
                        color: "#fff",
                        fontFamily: "'Inter',sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        boxShadow: `0 6px 18px ${AURA.blue}55`,
                      }}
                  >
                    <Download size={13} /> Instalar
                  </button>
                </>
            ) : mode === "ios-safari" ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: AURA.goldLight, margin: "0 0 3px" }}>
                    Adicionar à Tela de Início
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: "rgba(245,240,232,.7)", margin: 0, lineHeight: 1.5 }}>
                    Toque em <Share size={11} style={{ transform: "translateY(2px)", color: AURA.goldLight }} />{" "}
                    Compartilhar, depois em <PlusSquare size={11} style={{ transform: "translateY(2px)", color: AURA.goldLight }} />{" "}
                    Adicionar à Tela de Início.
                  </p>
                </>
            ) : (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: AURA.goldLight, margin: "0 0 3px" }}>
                    Use o Safari para instalar
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: "rgba(245,240,232,.7)", margin: 0, lineHeight: 1.5 }}>
                    No iOS, apps só podem ser instalados pelo Safari. Abra este link no
                    Safari e toque em Compartilhar → Adicionar à Tela de Início.
                  </p>
                </>
            )}
          </div>

          <button
              onClick={dismiss}
              aria-label="Fechar"
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.08)",
                color: "rgba(245,240,232,.6)",
                padding: 6,
                borderRadius: 9,
                cursor: "pointer",
                flexShrink: 0,
                display: "flex",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = AURA.gold; e.currentTarget.style.color = AURA.goldLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(245,240,232,.6)"; }}
          >
            <X size={15} />
          </button>
        </div>
      </div>
  );
}

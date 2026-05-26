import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api.js";
import { Bell, Cake, X, Phone } from "lucide-react";

const IEQ = {
    red: "#C8102E", redDark: "#8B0B1F", redLight: "#E8294A",
    yellow: "#FDB813",
    blue: "#003DA5", blueDark: "#002470", blueLight: "#1A56C4",
    offWhite: "#F5F0E8",
};

const globalStyles = (isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

  @keyframes badgePop  { 0%{transform:scale(0)} 70%{transform:scale(1.25)} 100%{transform:scale(1)} }
  @keyframes bellShake {
    0%,100%{transform:rotate(0)}
    15%{transform:rotate(18deg)}
    30%{transform:rotate(-16deg)}
    45%{transform:rotate(12deg)}
    60%{transform:rotate(-8deg)}
    75%{transform:rotate(4deg)}
  }
  @keyframes dropIn      { from{opacity:0;transform:translateY(-10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes slideUpIn   { from{opacity:0;transform:translateX(-50%) translateY(12px) scale(.97)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
  @keyframes fadeIn      { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer     { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes confetti    {
    0%  { transform: translateY(0) rotate(0deg);   opacity: 1; }
    100%{ transform: translateY(60px) rotate(720deg); opacity: 0; }
  }
  @keyframes backdropIn  { from{opacity:0} to{opacity:1} }

  .ieq-bell-btn {
    position: relative;
    width: 44px; height: 44px; border-radius: 10px;
    background: ${isDark ? "rgba(200,16,46,.1)" : "rgba(200,16,46,.08)"};
    border: 1px solid rgba(200,16,46,.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .25s;
    color: ${IEQ.red};
  }
  .ieq-bell-btn:hover { background: rgba(200,16,46,.18); border-color: ${IEQ.red}; transform: translateY(-1px); }
  .ieq-bell-btn.ringing .bell-icon { animation: bellShake .7s ease; }

  .ieq-badge {
    position: absolute; top: -6px; right: -6px;
    min-width: 20px; height: 20px; border-radius: 99px;
    background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red});
    color: #fff; font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    padding: 0 5px; border: 2px solid ${isDark ? "#110A0D" : "#fff"};
    animation: badgePop .4s cubic-bezier(.34,1.56,.64,1) both;
    box-shadow: 0 2px 8px rgba(200,16,46,.5);
  }

  /* Desktop: dropdown ancorado à direita do botão */
  .ieq-dropdown {
    position: absolute; top: calc(100% + 12px); right: 0;
    width: 340px; border-radius: 14px;
    background: ${isDark ? "rgba(17,10,13,.98)" : "rgba(255,255,255,.98)"};
    border: 1px solid rgba(200,16,46,.2);
    box-shadow: 0 20px 60px rgba(0,0,0,.3), 0 0 0 1px rgba(200,16,46,.05);
    backdrop-filter: blur(24px);
    animation: dropIn .25s cubic-bezier(.34,1.1,.64,1) both;
    z-index: 9999; overflow: hidden;
  }

  /* Mobile: painel centralizado fixo na tela */
  @media (max-width: 599px) {
    .ieq-dropdown {
      position: fixed;
      top: 50%;
      left: 50%;
      right: auto;
      transform: translateX(-50%) translateY(-50%);
      width: calc(100vw - 32px);
      max-width: 360px;
      max-height: 80vh;
      overflow-y: auto;
      animation: none;
      border-radius: 16px;
    }
  }

  /* Backdrop escuro só no mobile */
  .ieq-mobile-backdrop {
    display: none;
  }
  @media (max-width: 599px) {
    .ieq-mobile-backdrop {
      display: block;
      position: fixed; inset: 0;
      background: rgba(10,6,8,.7);
      backdrop-filter: blur(6px);
      z-index: 9998;
      animation: backdropIn .2s ease;
    }
  }

  .ieq-drop-header {
    padding: 18px 20px 14px;
    background: linear-gradient(135deg, rgba(200,16,46,.12), rgba(253,184,19,.06));
    border-bottom: 1px solid rgba(200,16,46,.1);
    display: flex; align-items: center; justify-content: space-between;
  }

  .ieq-member-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 20px; transition: background .2s;
    animation: fadeIn .35s ease both;
    border-bottom: 1px solid ${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)"};
  }
  .ieq-member-row:last-child { border-bottom: none; }
  .ieq-member-row:hover { background: ${isDark ? "rgba(200,16,46,.06)" : "rgba(200,16,46,.04)"}; }

  .ieq-avatar {
    width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.blue});
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-family: 'Cinzel', serif; font-weight: 700; font-size: 18px;
    position: relative;
  }
  .ieq-cake-badge {
    position: absolute; bottom: -4px; right: -4px;
    width: 18px; height: 18px; border-radius: 50%;
    background: ${IEQ.yellow}; display: flex; align-items: center; justify-content: center;
    border: 2px solid ${isDark ? "#110A0D" : "#fff"};
  }

  .ieq-confetti-dot {
    position: absolute; width: 6px; height: 6px; border-radius: 2px;
    animation: confetti 1.2s ease-out forwards;
    pointer-events: none;
  }

  .ieq-empty {
    padding: 32px 20px; text-align: center;
  }

  .ieq-shimmer-line {
    height: 12px; border-radius: 6px; margin-bottom: 8px;
    background: linear-gradient(90deg,
      ${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.05)"} 25%,
      ${isDark ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.1)"} 50%,
      ${isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.05)"} 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
`;

const CONFETTI_COLORS = [IEQ.red, IEQ.yellow, IEQ.blue, IEQ.redLight, IEQ.blueLight, "#fff"];

function ConfettiParticles() {
    return (
        <>
            {Array.from({ length: 10 }).map((_, i) => (
                <span
                    key={i}
                    className="ieq-confetti-dot"
                    style={{
                        left: `${10 + i * 8}%`,
                        top: "0%",
                        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: `${1 + Math.random() * 0.6}s`,
                    }}
                />
            ))}
        </>
    );
}

export default function SinoAniversariantes({ isDark = false }) {
    const [aberto,  setAberto]  = useState(false);
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visto,   setVisto]   = useState(false);
    const [ringing, setRinging] = useState(false);
    const dropRef = useRef(null);

    const tp = isDark ? IEQ.offWhite : "#1A0A0D";
    const ts = isDark ? "rgba(245,240,232,.45)" : "rgba(26,10,13,.45)";

    const buscarAniversariantes = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/aniversariantes/hoje`);
            const lista = res.data || [];
            setMembros(lista);
            if (lista.length > 0) {
                setRinging(true);
                setTimeout(() => setRinging(false), 800);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        buscarAniversariantes();
        const intervalo = setInterval(buscarAniversariantes, 60 * 60 * 1000);
        return () => clearInterval(intervalo);
    }, [buscarAniversariantes]);

    // Fecha ao clicar fora (desktop)
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setAberto(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Trava scroll do body quando modal mobile está aberto
    useEffect(() => {
        if (aberto) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [aberto]);

    const handleAbrir = () => {
        setAberto((v) => !v);
        setVisto(true);
    };

    const fechar = () => setAberto(false);

    const temAniversario = membros.length > 0;
    const mostrarBadge   = temAniversario && !visto;

    return (
        <>
            <style>{globalStyles(isDark)}</style>

            {/* Backdrop mobile — clica fora para fechar */}
            {aberto && (
                <div className="ieq-mobile-backdrop" onClick={fechar} />
            )}

            <div ref={dropRef} style={{ position: "relative", display: "inline-block" }}>

                {/* Botão sino */}
                <button
                    className={`ieq-bell-btn ${ringing ? "ringing" : ""}`}
                    onClick={handleAbrir}
                    title="Aniversariantes de hoje"
                >
                    <Bell size={20} className="bell-icon" />
                    {mostrarBadge && (
                        <span className="ieq-badge">{membros.length}</span>
                    )}
                </button>

                {/* Dropdown / Modal */}
                {aberto && (
                    <div className="ieq-dropdown">

                        {/* Cabeçalho */}
                        <div className="ieq-drop-header" style={{ position: "relative", overflow: "hidden" }}>
                            {temAniversario && <ConfettiParticles />}
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Cake size={18} style={{ color: IEQ.yellow }} />
                                <div>
                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: ".16em", color: IEQ.red, margin: 0 }}>
                                        ANIVERSARIANTES
                                    </p>
                                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: ts, margin: "2px 0 0" }}>
                                        {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={fechar}
                                style={{ background: "none", border: "none", cursor: "pointer", color: ts, padding: 4, borderRadius: 6 }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Conteúdo */}
                        {loading ? (
                            <div style={{ padding: "16px 20px" }}>
                                {[1, 2].map((i) => (
                                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 10, background: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)" }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="ieq-shimmer-line" style={{ width: "60%" }} />
                                            <div className="ieq-shimmer-line" style={{ width: "40%", height: 10 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : membros.length === 0 ? (
                            <div className="ieq-empty">
                                <Cake size={32} style={{ color: ts, margin: "0 auto 10px", display: "block" }} />
                                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".16em", color: ts, margin: 0 }}>
                                    NENHUM ANIVERSARIANTE HOJE
                                </p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: 320, overflowY: "auto" }}>
                                {membros.map((m, idx) => (
                                    <div key={m.id} className="ieq-member-row" style={{ animationDelay: `${idx * 0.07}s` }}>
                                        <div className="ieq-avatar">
                                            {m.nome.charAt(0)}
                                            <div className="ieq-cake-badge">
                                                <Cake size={10} style={{ color: IEQ.redDark }} />
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 15, fontWeight: 600, color: tp, margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {m.nome}
                                            </p>
                                            {m.telefone && (
                                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                    <Phone size={11} style={{ color: IEQ.red, flexShrink: 0 }} />
                                                    <span style={{ fontFamily: "'EB Garamond',serif", fontSize: 12, color: ts }}>{m.telefone}</span>
                                                </div>
                                            )}
                                        </div>
                                        {m.dataNascimento && (() => {
                                            const nasc  = new Date(m.dataNascimento);
                                            const hoje  = new Date();
                                            const idade = hoje.getFullYear() - nasc.getFullYear();
                                            return (
                                                <div style={{ background: `linear-gradient(135deg, ${IEQ.redDark}, ${IEQ.red})`, borderRadius: 8, padding: "4px 10px", flexShrink: 0 }}>
                                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>{idade}</p>
                                                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".1em", color: "rgba(255,255,255,.7)", margin: 0 }}>ANOS</p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Rodapé */}
                        {temAniversario && !loading && (
                            <div style={{
                                padding: "12px 20px",
                                background: isDark ? "rgba(253,184,19,.06)" : "rgba(253,184,19,.08)",
                                borderTop: `1px solid rgba(253,184,19,.2)`,
                                display: "flex", alignItems: "center", gap: 8,
                            }}>
                                <span style={{ fontSize: 14 }}>🎂</span>
                                <p style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 13, color: ts, margin: 0 }}>
                                    Não esqueça de ligar e abençoar!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
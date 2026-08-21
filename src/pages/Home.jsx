import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/* ── identidade: "igreja em células" — luz da manhã, crescimento orgânico ── */
const BRAND = {
    paper: "#F3F1EA",
    paperDeep: "#E9E4D6",
    ink: "#1B2333",
    inkSoft: "#3E4A5E",
    muted: "#8B93A0",
    moss: "#1E3F66",
    mossDeep: "#12283F",
    mossLight: "#4C7EB0",
    gold: "#B8892E",
    goldLight: "#D9AE5E",
    roxo: "#5B2A6E",
    clay: "#9E2A2B",
    line: "rgba(27,35,51,.10)",
};

/* ── tiny hook: revela elementos ao entrar na viewport ── */
function useFadeIn() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.style.opacity = "1";
                    el.style.transform = "translateY(0)";
                    obs.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

/* ── componente de seção animada ── */
function FadeSection({ children, delay = 0, style = {} }) {
    const ref = useFadeIn();
    return (
        <div
            ref={ref}
            style={{
                opacity: 0,
                transform: "translateY(28px)",
                transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

/* ── divisor decorativo ── */
function Divider() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 auto", maxWidth: 200 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${BRAND.gold})` }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.gold }} />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${BRAND.gold})` }} />
        </div>
    );
}

/* ── célula hexagonal — a assinatura visual da marca ── */
function HexCell({ size = 1, opacity = 1, filled = false, color = BRAND.moss }) {
    const w = 40 * size;
    const h = w * 1.1547;
    return (
        <svg width={w} height={h} viewBox="0 0 40 46" style={{ opacity }}>
            <polygon
                points="20,1 38,12 38,34 20,45 2,34 2,12"
                fill={filled ? color : "none"}
                stroke={color}
                strokeWidth="1.2"
            />
        </svg>
    );
}

/* ── ícones SVG embutidos ── */
const IconUsers = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const IconCell = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="8.5" x2="22" y2="8.5" /><line x1="2" y1="15.5" x2="22" y2="15.5" />
    </svg>
);
const IconChart = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
);
const IconShield = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
);
const IconCalendar = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IconMoney = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);
const IconArrow = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const IconCross = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="9" x2="22" y2="9" />
    </svg>
);
const IconCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRAND.moss} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const features = [
    { icon: <IconUsers />, title: "Membros e Famílias", desc: "Cadastro completo com fotos, endereços, histórico de batismo, ingresso e muito mais." },
    { icon: <IconCell />, title: "Gestão de Células", desc: "Acompanhe cada célula, supervisores e líderes, frequência e relatórios semanais." },
    { icon: <IconCalendar />, title: "Eventos e Agenda", desc: "Planejamento de cultos, retiros, conferências e atividades por departamento." },
    { icon: <IconChart />, title: "Relatórios Detalhados", desc: "Gráficos de crescimento, frequência e discipulado com exportação em PDF." },
    { icon: <IconMoney />, title: "Controle Financeiro", desc: "Dízimos, ofertas, tesouraria e relatórios para prestação de contas." },
    { icon: <IconShield />, title: "Acesso por Perfil", desc: "Pastor, líder, secretaria — cada um acessa somente o que precisa." },
];

const stats = [
    { value: "100%", label: "Focado em igrejas" },
    { value: "24/7", label: "Acesso online" },
    { value: "0 papel", label: "Tudo digital" },
    { value: "1 lugar", label: "Toda sua gestão" },
];



export default function Home() {
    const navigate = useNavigate();
    const heroRef = useRef(null);

    /* parallax sutil no hero */
    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                heroRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <Helmet>
                <title>IEQ Gestão — Sistema Eclesiástico para Igrejas em Células</title>
                <meta name="description" content="Sistema exclusivo para igrejas da IEQ. Gerencie membros, células, discipulado, agenda e financeiro em um só lugar." />
                <meta name="robots" content="index, follow" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ fontFamily: "'Inter', sans-serif", background: BRAND.paper, color: BRAND.ink, overflowX: "hidden" }}>

                {/* ═══════════════════════════════ NAV ═══════════════════════════════ */}
                <nav style={{
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 clamp(20px, 5vw, 80px)",
                    height: 64,
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <IconCross />
                        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, letterSpacing: "0.01em", color: "#fff" }}>
              IEQ <span style={{ color: BRAND.goldLight }}>Gestão</span>
            </span>
                    </div>

                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        <button
                            onClick={() => navigate("/login")}
                            style={{
                                padding: "8px 24px",
                                border: `1px solid ${BRAND.goldLight}`,
                                borderRadius: 4,
                                background: "transparent",
                                color: BRAND.goldLight,
                                cursor: "pointer",
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 14,
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                                transition: "all 0.25s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = BRAND.goldLight; e.currentTarget.style.color = "#12131C"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = BRAND.goldLight; }}
                        >
                            ENTRAR
                        </button>
                    </div>
                </nav>

                {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
                <section style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    padding: "80px clamp(20px, 5vw, 80px) 60px",
                    textAlign: "center",
                }}>
                    {/* fundo desfocado — preenche a seção sem cortar a imagem */}
                    <div style={{
                        position: "absolute", inset: 0, zIndex: 0,
                        backgroundImage: "url(/40dias-milagres.png)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(38px) brightness(.7) saturate(1.1)",
                        transform: "scale(1.15)",
                    }} />

                    {/* imagem nítida, centralizada, sem cortes */}
                    <img
                        src="/40dias-milagres.png"
                        alt="40 Dias de Milagres — Avante e Sem Parar"
                        style={{
                            position: "absolute", inset: 0, margin: "auto",
                            width: "100%", height: "100%",
                            objectFit: "contain",
                            zIndex: 0,
                            filter: "drop-shadow(0 20px 60px rgba(0,0,0,.5))",
                        }}
                    />
                </section>

                {/* ═══════════════════════════════ STATS ═══════════════════════════════ */}
                <section style={{
                    background: BRAND.paperDeep,
                    borderTop: `1px solid ${BRAND.line}`,
                    borderBottom: `1px solid ${BRAND.line}`,
                    padding: "40px clamp(20px, 5vw, 80px)",
                }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: 1,
                        maxWidth: 900, margin: "0 auto",
                    }}>
                        {stats.map((s, i) => (
                            <FadeSection key={i} delay={i * 80}>
                                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 600, color: BRAND.moss, lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: 12, color: BRAND.muted, marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
                                </div>
                            </FadeSection>
                        ))}
                    </div>
                </section>

                {/* ═══════════════════════════════ FEATURES ═══════════════════════════════ */}
                <section id="funcionalidades" style={{ padding: "100px clamp(20px, 5vw, 80px)" }}>
                    <FadeSection>
                        <div style={{ textAlign: "center", marginBottom: 64 }}>
                            <p style={{ fontSize: 12, color: BRAND.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Módulos do sistema</p>
                            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600, margin: "0 0 16px", color: BRAND.ink }}>
                                Tudo que sua igreja precisa
                            </h2>
                            <p style={{ color: BRAND.inkSoft, maxWidth: 480, margin: "0 auto" }}>
                                Cada módulo foi pensado para a realidade das igrejas em células da IEQ.
                            </p>
                        </div>
                    </FadeSection>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 1,
                        maxWidth: 1100, margin: "0 auto",
                        border: `1px solid ${BRAND.line}`,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: BRAND.line,
                    }}>
                        {features.map((f, i) => (
                            <FadeSection key={i} delay={i * 60}>
                                <div
                                    style={{
                                        padding: "36px 32px",
                                        background: i % 2 === 0 ? BRAND.paperDeep : BRAND.paper,
                                        transition: "background 0.25s",
                                        cursor: "default",
                                        height: "100%",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(30,63,102,0.08)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? BRAND.paperDeep : BRAND.paper; }}
                                >
                                    <div style={{ color: BRAND.moss, marginBottom: 16 }}>{f.icon}</div>
                                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, margin: "0 0 10px", color: BRAND.ink }}>{f.title}</h3>
                                    <p style={{ fontSize: 14, color: BRAND.inkSoft, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                                </div>
                            </FadeSection>
                        ))}
                    </div>
                </section>

                {/* ═══════════════════════════════ ABOUT / MISSÃO ═══════════════════════════════ */}
                <section style={{
                    padding: "80px clamp(20px, 5vw, 80px)",
                    background: BRAND.paperDeep,
                    borderTop: `1px solid ${BRAND.line}`,
                    borderBottom: `1px solid ${BRAND.line}`,
                }}>
                    <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
                        <FadeSection>
                            <p style={{ fontSize: 12, color: BRAND.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Por que o IEQ Gestão</p>
                            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 600, margin: "0 0 24px", lineHeight: 1.2, color: BRAND.ink }}>
                                Feito para a realidade da sua igreja
                            </h2>
                            <p style={{ color: BRAND.inkSoft, lineHeight: 1.9, marginBottom: 32, fontSize: 15 }}>
                                Sistemas genéricos não entendem a estrutura de uma igreja em células.
                                O IEQ Gestão foi construído a partir das necessidades reais: supervisões,
                                líderes, relatórios pastorais e discipulado intencional.
                            </p>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                                {["Hierarquia de células e supervisões", "Relatórios por área e pastor", "Controle de frequência e crescimento", "Histórico individual de cada membro"].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: BRAND.inkSoft }}>
                                        <IconCheck /> {item}
                                    </li>
                                ))}
                            </ul>
                        </FadeSection>

                        <FadeSection delay={150}>
                            <div style={{
                                border: `1px solid rgba(30,63,102,0.25)`,
                                borderRadius: 8,
                                padding: "40px 36px",
                                background: BRAND.paper,
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${BRAND.moss}, ${BRAND.mossDeep})`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: 18, fontWeight: 600,
                                        color: BRAND.paper,
                                    }}>P</div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px", color: BRAND.ink }}>Pastor Responsável</p>
                                        <p style={{ fontSize: 12, color: BRAND.muted, margin: 0 }}>Igreja IEQ Local</p>
                                    </div>
                                </div>

                                <blockquote style={{
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: "clamp(16px, 2.2vw, 20px)",
                                    fontStyle: "italic",
                                    color: BRAND.ink,
                                    lineHeight: 1.7,
                                    margin: 0,
                                    borderLeft: `3px solid ${BRAND.gold}`,
                                    paddingLeft: 20,
                                }}>
                                    "Finalmente um sistema que entende
                                    como funcionamos. Antes perdíamos horas
                                    com planilhas. Hoje o relatório de célula
                                    está a um clique."
                                </blockquote>
                            </div>
                        </FadeSection>
                    </div>
                </section>

                {/* ═══════════════════════════════ CTA FINAL ═══════════════════════════════ */}
                <section style={{
                    padding: "120px clamp(20px, 5vw, 80px)",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 700, height: 400,
                        borderRadius: "50%",
                        background: `radial-gradient(ellipse, rgba(30,63,102,0.12) 0%, transparent 70%)`,
                        pointerEvents: "none",
                    }} />

                    <FadeSection style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
                        <Divider />
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 600, margin: "32px 0 16px", color: BRAND.ink }}>
                            Pronto para começar?
                        </h2>
                        <p style={{ color: BRAND.inkSoft, fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
                            Acesse o sistema agora e experimente uma gestão
                            mais organizada para a sua congregação.
                        </p>

                        <button
                            onClick={() => navigate("/login")}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 12,
                                padding: "16px 40px",
                                border: "none",
                                borderRadius: 4,
                                background: `linear-gradient(135deg, ${BRAND.moss}, ${BRAND.mossDeep})`,
                                color: BRAND.paper,
                                cursor: "pointer",
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 15, fontWeight: 700,
                                letterSpacing: "0.05em",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                boxShadow: `0 0 0 0px ${BRAND.moss}`,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(30,63,102,0.3)`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 0 0 0px ${BRAND.moss}`; }}
                        >
                            Entrar no Sistema <IconArrow />
                        </button>
                    </FadeSection>
                </section>

                {/* ═══════════════════════════════ FOOTER ═══════════════════════════════ */}
                <footer style={{
                    background: BRAND.paperDeep,
                    borderTop: `1px solid ${BRAND.line}`,
                    padding: "32px clamp(20px, 5vw, 80px)",
                }}>
                    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <IconCross />
                            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: BRAND.ink }}>
                IEQ <span style={{ color: BRAND.moss }}>Gestão</span>
              </span>
                        </div>

                        <p style={{ fontSize: 12, color: BRAND.muted, margin: 0, textAlign: "center" }}>
                            © {new Date().getFullYear()} IEQ Gestão — Sistema Eclesiástico.
                            Suporte:{" "}
                            <a href="mailto:washquesia@gmail.com" style={{ color: BRAND.gold, textDecoration: "none" }}>
                                washquesia@gmail.com
                            </a>
                        </p>

                        <div style={{ fontSize: 12, color: BRAND.muted }}>
                            Uso exclusivo da IEQ
                        </div>
                    </div>
                </footer>

            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes scrollDown {
          0%, 100% { opacity: 0.3; transform: scaleY(1); transform-origin: top; }
          50% { opacity: 0.8; transform: scaleY(1.4); transform-origin: top; }
        }

        /* Responsivo: duas colunas no tablet e mobile */
        @media (max-width: 700px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
        </>
    );
}

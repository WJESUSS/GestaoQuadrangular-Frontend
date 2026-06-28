import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const BRAND = {
    blue: "#003DA5",
    blueDark: "#002470",
    violet: "#003DA5",
    violetDeep: "#002470",
    dark: "#0A0A0F",
    stone: "#12121A",
    light: "#E8F1FB",
    muted: "#4A6585",
    gold: "#C9A96E",
    goldLight: "#E8D5A3",
    red: "#C8102E",
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

/* ── ícones SVG embutidos ── */
const IconUsers = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const IconCell = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="8.5" x2="22" y2="8.5" /><line x1="2" y1="15.5" x2="22" y2="15.5" />
    </svg>
);
const IconChart = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
);
const IconShield = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
);
const IconCalendar = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IconMoney = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);
const IconArrow = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const IconCross = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={BRAND.gold} strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="9" x2="22" y2="9" />
    </svg>
);
const IconCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRAND.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
    const [menuOpen, setMenuOpen] = useState(false);
    const heroRef = useRef(null);

    /* parallax sutil no hero */
    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                heroRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
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
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ fontFamily: "'Manrope', sans-serif", background: "linear-gradient(90deg, #5c5c5c,#333333,#000000,#000000,#000000)", color: "#fff", overflowX: "hidden" }}>

                {/* ═══════════════════════════════ NAV ═══════════════════════════════ */}
                <nav style={{
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 clamp(20px, 5vw, 80px)",
                    height: 64,
                    background: "rgba(7,6,15,0.92)",
                    backdropFilter: "blur(12px)",
                    borderBottom: `1px solid rgba(0,61,165,0.18)`,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <IconCross />
                        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.02em" }}>
              IEQ <span style={{ color: BRAND.blue }}>Gestão</span>
            </span>
                    </div>

                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        <button
                            onClick={() => navigate("/login")}
                            style={{
                                padding: "8px 24px",
                                border: `1px solid ${BRAND.blue}`,
                                borderRadius: 4,
                                background: "transparent",
                                color: "#fff",
                                cursor: "pointer",
                                fontFamily: "'Manrope', sans-serif",
                                fontSize: 14,
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                                transition: "all 0.25s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = BRAND.blue; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
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
                    {/* Grade decorativa de fundo */}
                    <div ref={heroRef} style={{
                        position: "absolute", inset: 0, zIndex: 0,
                        backgroundImage: `
              linear-gradient(rgba(0,61,165,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,61,165,0.05) 1px, transparent 1px)
            `,
                        backgroundSize: "60px 60px",
                    }} />

                    {/* Glow central */}
                    <div style={{
                        position: "absolute",
                        top: "40%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 600, height: 600,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, rgba(0,61,165,0.22) 0%, transparent 70%)`,
                        zIndex: 0,
                    }} />

                    <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
                        {/* Etiqueta */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "rgba(0,61,165,0.1)",
                            border: `1px solid rgba(0,61,165,0.3)`,
                            borderRadius: 100,
                            padding: "5px 16px",
                            marginBottom: 32,
                            fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                            color: BRAND.blue,
                            textTransform: "uppercase",
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.blue, display: "inline-block", animation: "pulse 2s infinite" }} />
                            Sistema exclusivo para a IEQ
                        </div>

                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(38px, 7vw, 76px)",
                            fontWeight: 700,
                            lineHeight: 1.1,
                            margin: "0 0 24px",
                            letterSpacing: "-0.02em",
                        }}>
                            Sua Igreja,<br />
                            <span style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Bem Administrada.</span>
                        </h1>

                        <p style={{
                            fontSize: "clamp(15px, 2vw, 18px)",
                            color: "rgba(255,255,255,0.6)",
                            lineHeight: 1.8,
                            maxWidth: 560,
                            margin: "0 auto 48px",
                        }}>
                            Plataforma criada especialmente para igrejas em células.
                            Controle membros, células, discipulado e financeiro
                            com simplicidade e segurança.
                        </p>

                        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                            <button
                                onClick={() => navigate("/login")}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "14px 32px",
                                    border: "none",
                                    borderRadius: 4,
                                    background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueDark})`,
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontFamily: "'Manrope', sans-serif",
                                    fontSize: 15, fontWeight: 700,
                                    letterSpacing: "0.04em",
                                    transition: "opacity 0.2s, transform 0.2s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                Acessar agora <IconArrow />
                            </button>

                            <button
                                onClick={() => document.getElementById("funcionalidades").scrollIntoView({ behavior: "smooth" })}
                                style={{
                                    padding: "14px 32px",
                                    border: `1px solid rgba(255,255,255,0.2)`,
                                    borderRadius: 4,
                                    background: "transparent",
                                    color: "rgba(255,255,255,0.7)",
                                    cursor: "pointer",
                                    fontFamily: "'Manrope', sans-serif",
                                    fontSize: 15, fontWeight: 500,
                                    transition: "border-color 0.2s, color 0.2s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.blue; e.currentTarget.style.color = BRAND.blue; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                            >
                                Ver funcionalidades
                            </button>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div style={{
                        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: "0.1em",
                    }}>
                        <span>ROLE PARA BAIXO</span>
                        <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)", animation: "scrollDown 1.5s ease-in-out infinite" }} />
                    </div>
                </section>

                {/* ═══════════════════════════════ STATS ═══════════════════════════════ */}
                <section style={{
                    background: BRAND.stone,
                    borderTop: `1px solid rgba(0,61,165,0.15)`,
                    borderBottom: `1px solid rgba(0,61,165,0.15)`,
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
                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: BRAND.blue, lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
                                </div>
                            </FadeSection>
                        ))}
                    </div>
                </section>

                {/* ═══════════════════════════════ FEATURES ═══════════════════════════════ */}
                <section id="funcionalidades" style={{ padding: "100px clamp(20px, 5vw, 80px)" }}>
                    <FadeSection>
                        <div style={{ textAlign: "center", marginBottom: 64 }}>
                            <p style={{ fontSize: 12, color: BRAND.blue, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Módulos do sistema</p>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, margin: "0 0 16px" }}>
                                Tudo que sua igreja precisa
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 auto" }}>
                                Cada módulo foi pensado para a realidade das igrejas em células da IEQ.
                            </p>
                        </div>
                    </FadeSection>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 1,
                        maxWidth: 1100, margin: "0 auto",
                        border: `1px solid rgba(255,255,255,0.06)`,
                        borderRadius: 8,
                        overflow: "hidden",
                    }}>
                        {features.map((f, i) => (
                            <FadeSection key={i} delay={i * 60}>
                                <div
                                    style={{
                                        padding: "36px 32px",
                                        background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                                        borderRight: (i + 1) % 3 !== 0 ? `1px solid rgba(255,255,255,0.06)` : "none",
                                        borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.06)` : "none",
                                        transition: "background 0.25s",
                                        cursor: "default",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,61,165,0.1)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"; }}
                                >
                                    <div style={{ color: BRAND.blue, marginBottom: 16 }}>{f.icon}</div>
                                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, margin: "0 0 10px" }}>{f.title}</h3>
                                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                                </div>
                            </FadeSection>
                        ))}
                    </div>
                </section>

                {/* ═══════════════════════════════ ABOUT / MISSÃO ═══════════════════════════════ */}
                <section style={{
                    padding: "80px clamp(20px, 5vw, 80px)",
                    background: BRAND.stone,
                    borderTop: `1px solid rgba(0,61,165,0.15)`,
                    borderBottom: `1px solid rgba(0,61,165,0.15)`,
                }}>
                    <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
                        <FadeSection>
                            <p style={{ fontSize: 12, color: BRAND.blue, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Por que o IEQ Gestão</p>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 700, margin: "0 0 24px", lineHeight: 1.2 }}>
                                Feito para a realidade da sua igreja
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.9, marginBottom: 32, fontSize: 15 }}>
                                Sistemas genéricos não entendem a estrutura de uma igreja em células.
                                O IEQ Gestão foi construído a partir das necessidades reais: supervisões,
                                líderes, relatórios pastorais e discipulado intencional.
                            </p>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                                {["Hierarquia de células e supervisões", "Relatórios por área e pastor", "Controle de frequência e crescimento", "Histórico individual de cada membro"].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                                        <IconCheck /> {item}
                                    </li>
                                ))}
                            </ul>
                        </FadeSection>

                        <FadeSection delay={150}>
                            <div style={{
                                border: `1px solid rgba(0,61,165,0.25)`,
                                borderRadius: 8,
                                padding: "40px 36px",
                                background: "rgba(0,61,165,0.05)",
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueDark})`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 18, fontWeight: 700,
                                    }}>P</div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>Pastor Responsável</p>
                                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>Igreja IEQ Local</p>
                                    </div>
                                </div>

                                <blockquote style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: "clamp(16px, 2.2vw, 20px)",
                                    fontStyle: "italic",
                                    color: "rgba(255,255,255,0.8)",
                                    lineHeight: 1.7,
                                    margin: 0,
                                    borderLeft: `3px solid ${BRAND.blue}`,
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
                        background: `radial-gradient(ellipse, rgba(0,61,165,0.22) 0%, transparent 70%)`,
                        pointerEvents: "none",
                    }} />

                    <FadeSection style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
                        <Divider />
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 700, margin: "32px 0 16px" }}>
                            Pronto para começar?
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
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
                                background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueDark})`,
                                color: "#fff",
                                cursor: "pointer",
                                fontFamily: "'Manrope', sans-serif",
                                fontSize: 15, fontWeight: 700,
                                letterSpacing: "0.05em",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                boxShadow: `0 0 0 0px ${BRAND.blue}`,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,61,165,0.4)`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 0 0 0px ${BRAND.blue}`; }}
                        >
                            Entrar no Sistema <IconArrow />
                        </button>
                    </FadeSection>
                </section>

                {/* ═══════════════════════════════ FOOTER ═══════════════════════════════ */}
                <footer style={{
                    background: BRAND.stone,
                    borderTop: `1px solid rgba(255,255,255,0.06)`,
                    padding: "32px clamp(20px, 5vw, 80px)",
                }}>
                    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <IconCross />
                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>
                IEQ <span style={{ color: BRAND.blue }}>Gestão</span>
              </span>
                        </div>

                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "center" }}>
                            © {new Date().getFullYear()} IEQ Gestão — Sistema Eclesiástico.
                            Suporte:{" "}
                             <a href="mailto:washquesia@gmail.com" style={{ color: BRAND.gold, textDecoration: "none" }}>
                                washquesia@gmail.com
                            </a>
                        </p>

                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
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
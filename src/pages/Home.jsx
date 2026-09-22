import { Helmet }        from "react-helmet-async";
import { useNavigate }   from "react-router-dom";
import { useEffect, useRef } from "react";
import { ArrowRight }    from "lucide-react";

/* ─── Arte de linhas (mesma do Login: azul → violeta → magenta) ─── */
const BLUE  = [64, 72, 255];
const VIOLET= [150, 44, 255];
const MAG   = [255, 44, 176];

function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const LINES_TR = [
    { d: "M46,-8 C-24,96 48,168 74,352", n: 60 },
    { d: "M14,-4 C-30,140 74,232 96,356", n: 54 },
    { d: "M-6,-2 C-40,190 96,300 108,358", n: 48 },
    { d: "M64,-10 C40,70 110,150 122,350", n: 42 },
];

function LineArt() {
    return (
        <svg className="art art-tr" viewBox="0 0 480 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {LINES_TR.map((ln, li) =>
                Array.from({ length: ln.n }).map((_, i) => {
                    const s = i / (ln.n - 1);
                    const t = s < 0.5 ? s * 2 : (s - 0.5) * 2;
                    const from = s < 0.5 ? BLUE : VIOLET;
                    const to   = s < 0.5 ? VIOLET : MAG;
                    const c = mix(from, to, t);
                    return (
                        <path
                            key={`${li}-${i}`}
                            d={ln.d}
                            stroke={`rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`}
                            strokeWidth="0.6"
                            fill="none"
                            opacity={s < 0.5 ? 0.5 + s : (1 - (s - 0.5))}
                        />
                    );
                })
            )}
        </svg>
    );
}

/* ─── tiny hook: revela elementos ao entrar na viewport ─── */
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

/* ─── Logo IEQ (mesma do Login) ─── */
function IEQCross({ size = 40 }) {
    return (
        <img
            src="/quadrangular.png"
            alt="Logo IEQ"
            style={{
                width: `${size}px`, height: `${size}px`,
                minWidth: `${size}px`, minHeight: `${size}px`,
                borderRadius: "50%", objectFit: "cover", display: "block",
            }}
        />
    );
}

/* ─── Ícones SVG embutidos (traço fino, cor do contexto) ─── */
const IconUsers = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const IconCell = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="8.5" x2="22" y2="8.5" /><line x1="2" y1="15.5" x2="22" y2="15.5" />
    </svg>
);
const IconChart = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
);
const IconShield = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
);
const IconCalendar = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IconMoney = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);
const IconCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

const profiles = ["Pastor", "Líder", "Secretaria", "Tesouraria", "Diácono"];

/* ══════════ PÁGINA: identidade espelhada do novo Login ══════════ */
export default function Home() {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>IEQ Gestão — Sistema Eclesiástico para Igrejas em Células</title>
                <meta name="description" content="Sistema exclusivo para igrejas da IEQ. Gerencie membros, células, discipulado, agenda e financeiro em um só lugar." />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:wght@600;700&display=swap');

        .ieq-home, .ieq-home *, .ieq-home *::before, .ieq-home *::after { box-sizing:border-box; }
        :where(.ieq-home, .ieq-home *) { margin:0; padding:0; }
        .ieq-home {
          position:relative; min-height:100vh; overflow-x:hidden;
          font-family:'Inter',system-ui,sans-serif; color:#fff;
          background:linear-gradient(180deg,#0A1D33 0%,#070D1C 45%,#0A1D33 100%);
        }
        .ieq-home button, .ieq-home a { font-family:inherit; }
        .ieq-home button { cursor:pointer; }

        /* ── backdrop: arte de linhas + glows (iguais ao Login) ── */
        .backdrop { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
        .art { position:absolute; }
        .art-tr { top:0; right:0; width:min(31vw,430px);
          -webkit-mask-image:linear-gradient(to bottom,#000 62%,transparent);
          mask-image:linear-gradient(to bottom,#000 62%,transparent); }
        .art-bl { left:0; bottom:0; width:min(29vw,400px); transform:rotate(180deg);
          -webkit-mask-image:linear-gradient(to bottom,#000 62%,transparent);
          mask-image:linear-gradient(to bottom,#000 62%,transparent); }
        .glow-streak { position:absolute; left:-14%; right:-14%; top:36%; height:180px; transform:rotate(-9deg);
          filter:blur(46px); background:linear-gradient(90deg,rgba(30,69,113,.75),rgba(15,42,74,.85),rgba(184,137,46,.55)); }
        .glow-blue { position:absolute; right:-3%; top:-10%; width:36%; height:62%;
          background:radial-gradient(closest-side, rgba(15,42,74,.8), transparent); filter:blur(30px); }

        /* ── nav fixada ── */
        .home-nav {
          position:fixed; top:0; left:0; right:0; z-index:50;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 clamp(20px, 5vw, 80px); height:64px;
          background:rgba(7,13,28,.72);
          backdrop-filter:blur(18px) saturate(1.4); -webkit-backdrop-filter:blur(18px) saturate(1.4);
          border-bottom:1px solid rgba(255,255,255,.10);
        }
        .brand { display:flex; align-items:center; gap:12px; color:#fff; font-size:19px; font-weight:900; letter-spacing:.02em; }
        .brand small { display:block; font-size:9px; font-weight:400; letter-spacing:.3em; text-transform:uppercase; opacity:.7; margin-top:2px; }
        .nav-cta {
          display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 24px; border:none;
          border-radius:999px; background:rgba(255,255,255,.30); color:#000;
          font-size:12.5px; font-weight:600; letter-spacing:.04em;
          transition:background .2s, transform .2s;
        }
        .nav-cta:hover { background:rgba(255,255,255,.42); transform:translateY(-1px); }
        .nav-cta:focus-visible { outline:2px solid #fff; outline-offset:2px; }

        /* ── hero: o cartão espelho do Login (dois painéis + divisor) ── */
        .hero {
          position:relative; z-index:1; min-height:100vh;
          display:flex; align-items:center; justify-content:center;
          padding:110px clamp(20px,5vw,80px) 60px;
        }
        .glass-hero {
          width:100%; max-width:940px; padding:clamp(30px,5vw,58px);
          display:flex; gap:46px; align-items:stretch;
          border-radius:44px; background:rgba(13,24,48,.72);
          border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(30px) saturate(1.3); -webkit-backdrop-filter:blur(30px) saturate(1.3);
          box-shadow:0 30px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.10);
        }
        .pane-left { flex:1.12; }
        .pane-right { flex:1; display:flex; flex-direction:column; justify-content:center; gap:18px; }
        .pane-divider { width:4px; border-radius:2px; background:#fff; opacity:.16; align-self:stretch; margin:0 6px; }
        .brand-name { display:flex; align-items:center; gap:14px; }
        .brand-name .nm { font-size:44px; font-weight:700; font-family:'Fraunces',serif; line-height:1; color:#fff; }
        .eyebrow-type { margin-top:18px; font-size:11px; letter-spacing:.26em; text-transform:uppercase; color:rgba(255,255,255,.62); }
        .headline { margin-top:10px; font-size:clamp(28px,3.2vw,38px); line-height:1.22; letter-spacing:-.02em; color:#fff; }
        .headline .heavy { font-weight:900; }
        .headline .thin { font-weight:300; display:block; }
        .left-para { margin-top:18px; font-size:15px; line-height:1.8; color:rgba(255,255,255,.78); max-width:380px; }
        .left-foot { margin-top:26px; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.5); }
        .pane-right h2 { font-size:24px; font-weight:900; letter-spacing:-.01em; color:#fff; margin:0; }
        .pane-right p { font-size:13.5px; line-height:1.7; color:rgba(255,255,255,.72); margin:0; }
        .profiles { display:flex; flex-wrap:wrap; gap:8px; }
        .profile-chip { padding:7px 14px; border-radius:999px; font-size:11.5px; font-weight:500;
          background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.18); color:rgba(255,255,255,.92); }
        .btn-pill {
          display:inline-flex; align-items:center; justify-content:center; gap:10px;
          height:44px; padding:0 30px; border-radius:999px; border:none;
          font-size:13px; font-weight:600; letter-spacing:.02em;
          transition:background .2s, border-color .2s, transform .2s;
        }
        .btn-primary { background:rgba(255,255,255,.30); color:#000; }
        .btn-primary:hover { background:rgba(255,255,255,.42); transform:translateY(-1px); }
        .btn-ghost { background:transparent; color:#fff; border:1px solid rgba(255,255,255,.55); }
        .btn-ghost:hover { background:rgba(255,255,255,.12); }

        /* ── faixa de números ── */
        .stats { position:relative; z-index:1; max-width:940px; margin:0 auto; padding:0 clamp(20px,5vw,80px);
          display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:14px; }
        .stat { padding:26px 16px; text-align:center; border-radius:28px;
          background:rgba(13,24,48,.72); border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(24px) saturate(1.3); -webkit-backdrop-filter:blur(24px) saturate(1.3);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08); }
        .stat b { display:block; font-size:28px; font-weight:900; letter-spacing:-.01em;
          background:linear-gradient(90deg,#D9AE5E,#B8892E); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .stat span { display:block; margin-top:8px; font-size:11px; font-weight:400; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.6); }

        /* ── seções ── */
        .section { position:relative; z-index:1; padding:96px clamp(20px,5vw,80px); }
        .section-head { text-align:center; margin-bottom:56px; }
        .kicker { font-size:11px; letter-spacing:.26em; text-transform:uppercase; color:#D9AE5E; margin-bottom:14px; }
        .section-head h2 { font-size:clamp(26px,3.6vw,40px); font-weight:900; letter-spacing:-.02em; color:#fff; margin:0; }
        .section-head p { margin:14px auto 0; max-width:560px; font-size:14.5px; line-height:1.75; color:rgba(255,255,255,.66); }

        /* ── grade de módulos ── */
        .feat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:18px; max-width:1120px; margin:0 auto; }
        .glass-card { padding:30px 26px; border-radius:28px;
          background:rgba(13,24,48,.72); border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(24px) saturate(1.3); -webkit-backdrop-filter:blur(24px) saturate(1.3);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
          transition:transform .25s, border-color .25s, box-shadow .25s; }
        .glass-card:hover { transform:translateY(-4px); border-color:rgba(217,174,94,.45); box-shadow:0 20px 50px rgba(0,0,0,.5); }
        .feat-ico { width:50px; height:50px; border-radius:50%; display:grid; place-items:center; margin-bottom:18px;
          background:rgba(217,174,94,.16); border:1px solid rgba(217,174,94,.35); color:#F0DFB8; }
        .glass-card h3 { font-size:16px; font-weight:700; color:#fff; margin-bottom:8px; }
        .glass-card p { font-size:13px; line-height:1.7; color:rgba(255,255,255,.66); }

        /* ── missão / sobre ── */
        .about { max-width:1120px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:46px; align-items:center; }
        .about h2 { font-size:clamp(24px,3.2vw,34px); font-weight:900; letter-spacing:-.02em; color:#fff; margin:0 0 18px; }
        .about-note { font-size:14.5px; line-height:1.85; color:rgba(255,255,255,.74); }
        .checks { list-style:none; display:flex; flex-direction:column; gap:12px; margin-top:24px; }
        .checks li { display:flex; align-items:center; gap:12px; font-size:13.5px; font-weight:500; color:rgba(255,255,255,.9); }
        .check-bubble { width:24px; height:24px; border-radius:50%; flex-shrink:0; display:grid; place-items:center;
          background:rgba(91,214,140,.16); border:1px solid rgba(91,214,140,.4); color:#7BE0A7; }

        /* ── cartão de citação (vidro) ── */
        .quote-card { position:relative; overflow:hidden; border-radius:44px; padding:44px 40px 40px;
          background:linear-gradient(160deg, rgba(30,69,113,.35), rgba(184,137,46,.16)), rgba(13,24,48,.72);
          border:1px solid rgba(255,255,255,.16);
          backdrop-filter:blur(28px) saturate(1.3); -webkit-backdrop-filter:blur(28px) saturate(1.3);
          box-shadow:0 30px 70px rgba(0,0,0,.5); }
        .quote-q { position:absolute; top:6px; right:34px; font-size:120px; font-weight:900; line-height:1; color:rgba(255,255,255,.12); }
        .quote-card blockquote { position:relative; z-index:2; font-size:18px; font-weight:400; line-height:1.75; color:#fff; font-style:italic; margin:0; }
        .quote-card cite { display:block; margin-top:22px; font-size:12px; font-style:normal; color:rgba(255,255,255,.68); letter-spacing:.02em; }
        .quote-card cite b { display:block; color:#fff; font-size:13.5px; font-weight:700; }

        /* ── CTA final ── */
        .cta { position:relative; z-index:1; text-align:center; padding:110px clamp(20px,5vw,80px); }
        .cta-inner { position:relative; z-index:1; max-width:560px; margin:0 auto; }
        .hairline { width:180px; height:1px; margin:0 auto 26px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent); }
        .cta h2 { font-size:clamp(26px,4vw,38px); font-weight:900; letter-spacing:-.02em; color:#fff; margin:0 0 16px; }
        .cta p { color:rgba(255,255,255,.7); font-size:15px; line-height:1.8; margin:0 0 34px; }

        /* ── rodapé ── */
        .home-foot { position:relative; z-index:1; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px;
          max-width:1120px; margin:0 auto; padding:30px clamp(20px,5vw,80px);
          border-top:1px solid rgba(255,255,255,.1); }
        .foot-brand { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:700; color:#fff; }
        .home-foot p { font-size:12px; color:rgba(255,255,255,.58); }
        .home-foot a { color:#D9AE5E; text-decoration:none; }
        .home-foot a:hover { text-decoration:underline; }

        @media (max-width:860px) {
          .glass-hero { flex-direction:column; gap:28px; }
          .pane-divider { width:100%; height:2px; margin:4px 0; align-self:auto; }
          .brand-name .nm { font-size:34px; }
          .left-para, .left-foot { display:none; }
          .about { grid-template-columns:1fr; gap:40px; }
          .hero { padding-top:110px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ieq-home *, .ieq-home *::before, .ieq-home *::after { animation:none !important; transition:none !important; }
        }
      `}</style>

            <div className="ieq-home">
                {/* ══════════ BACKDROP (linhas + glows) ══════════ */}
                <div className="backdrop">
                    <div className="glow-blue"/>
                    <div className="glow-streak"/>
                    <LineArt/>
                    <div className="art art-bl"><LineArt/></div>
                </div>

                {/* ══════════ NAV ══════════ */}
                <nav className="home-nav">
                    <div className="brand">
                        <IEQCross size={38}/>
                        <span>
                            IEQ <span style={{ fontWeight: 300 }}>Gestão</span>
                            <small>Portal Administrativo</small>
                        </span>
                    </div>
                    <button className="nav-cta" onClick={() => navigate("/login")}>
                        Entrar <ArrowRight size={14}/>
                    </button>
                </nav>

                {/* ══════════ HERO (espelho do Login) ══════════ */}
                <section className="hero">
                    <div className="glass-hero">
                        <div className="pane-left">
                            <div className="brand-name">
                                <IEQCross size={52}/>
                                <span className="nm">IEQ</span>
                            </div>
                            <p className="eyebrow-type">IEQ · Pituaçu</p>
                            <h1 className="headline">
                                <span className="heavy">Sua Igreja,</span>
                                <span className="thin">Bem Administrada.</span>
                            </h1>
                            <p className="left-para">
                                Gestão completa de membros, células, discipulado, agenda e
                                tesouraria — tudo em um só lugar, pensado para a realidade da sua congregação.
                            </p>
                            <p className="left-foot">Fé, Família e Missão · © {new Date().getFullYear()}</p>
                        </div>

                        <div className="pane-divider"/>

                        <div className="pane-right">
                            <h2>Acesse o sistema</h2>
                            <p>Entre com o seu perfil e comece hoje mesmo. Um acesso único, seguro e simples.</p>
                            <div className="profiles">
                                {profiles.map(p => <span className="profile-chip" key={p}>{p}</span>)}
                            </div>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
                                <button className="btn-pill btn-primary" onClick={() => navigate("/login")}>
                                    Entrar no Sistema <ArrowRight size={16}/>
                                </button>
                                <button className="btn-pill btn-ghost" onClick={() => navigate("/login")}>
                                    Solicitar acesso
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════ STATS ══════════ */}
                <section className="section" style={{ paddingTop: 40, paddingBottom: 60, paddingLeft: 0, paddingRight: 0 }}>
                    <FadeSection>
                        <div className="stats">
                            {stats.map((s, i) => (
                                <div className="stat" key={i}>
                                    <b>{s.value}</b>
                                    <span>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </FadeSection>
                </section>

                {/* ══════════ FEATURES ══════════ */}
                <section className="section" style={{ paddingTop: 12 }}>
                    <div className="section-head">
                        <p className="kicker">Módulos do sistema</p>
                        <h2>Tudo o que a sua igreja precisa</h2>
                        <p>Do cadastro do membro ao relatório pastoral, sem planilhas e sem retrabalho.</p>
                    </div>
                    <div className="feat-grid">
                        {features.map((f, i) => (
                            <FadeSection key={i} delay={(i % 3) * 80}>
                                <div className="glass-card">
                                    <div className="feat-ico">{f.icon}</div>
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                </div>
                            </FadeSection>
                        ))}
                    </div>
                </section>

                {/* ══════════ MISSÃO ══════════ */}
                <section className="section">
                    <div className="about">
                        <FadeSection>
                            <p className="kicker">Por que o IEQ Gestão</p>
                            <h2>Feito para a realidade da sua igreja</h2>
                            <p className="about-note">
                                Sistemas genéricos não entendem a estrutura de uma igreja em células.
                                O IEQ Gestão foi construído a partir das necessidades reais: supervisões,
                                líderes, relatórios pastorais e discipulado intencional.
                            </p>
                            <ul className="checks">
                                {["Hierarquia de células e supervisões", "Relatórios por área e pastor", "Controle de frequência e crescimento", "Histórico individual de cada membro"].map((item, i) => (
                                    <li key={i}>
                                        <span className="check-bubble"><IconCheck/></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </FadeSection>

                        <FadeSection delay={150}>
                            <div className="quote-card">
                                <span className="quote-q">"</span>
                                <blockquote>
                                    Finalmente um sistema que entende como funcionamos.
                                    Antes perdíamos horas com planilhas. Hoje o relatório de
                                    célula está a um clique.
                                </blockquote>
                                <cite>
                                    <b>Pastor Responsável</b>
                                    Igreja IEQ Local · Pituaçu
                                </cite>
                            </div>
                        </FadeSection>
                    </div>
                </section>

                {/* ══════════ CTA FINAL ══════════ */}
                <section className="cta">
                    <FadeSection style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
                        <div className="hairline"/>
                        <h2>Pronto para começar?</h2>
                        <p>
                            Acesse o sistema agora e experimente uma gestão
                            mais organizada para a sua congregação.
                        </p>
                        <button className="btn-pill btn-primary" onClick={() => navigate("/login")}>
                            Entrar no Sistema <ArrowRight size={16}/>
                        </button>
                    </FadeSection>
                </section>

                {/* ══════════ FOOTER ══════════ */}
                <footer>
                    <div className="home-foot">
                        <div className="foot-brand">
                            <IEQCross size={34}/>
                            <span>IEQ Gestão</span>
                        </div>
                        <p style={{ textAlign: "center" }}>
                            © {new Date().getFullYear()} IEQ Gestão — Sistema Eclesiástico. Suporte:{" "}
                            <a href="mailto:washquesia@gmail.com">washquesia@gmail.com</a>
                        </p>
                        <p>Uso exclusivo da IEQ</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
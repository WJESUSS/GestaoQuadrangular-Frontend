import { Helmet }        from "react-helmet-async";
import { useNavigate }   from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun, ArrowRight } from "lucide-react";
import { useTheme }      from "../context/ThemeContext";

/* ─── Paleta "Dunas" (mesma identidade da tela de Login) ─── */
const P = {
    plum:"#834D87", plumDark:"#6B3A70", plumDeep:"#583575",
    pink:"#F598AD", pinkSoft:"#F7B3C4", ink:"#200A3F",
    red:"#9E2A2B", gold:"#B8892E", goldLight:"#D9AE5E",
    panel:"#F1F1F3", glass:"#FFFFFF",
    chip:"rgba(245,152,173,.22)", chipB:"rgba(131,77,135,.40)",
    line:"rgba(32,10,63,.10)",
};

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

/* ── divisor decorativo em ouro ── */
function Divider() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 auto", maxWidth: 200 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${P.gold})` }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: P.gold }} />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${P.gold})` }} />
        </div>
    );
}

/* ─── Logo IEQ (haste em pílula, igual ao Login) ─── */
function IEQCross({ size = 40, src = "/quadrangular.png" }) {
    return (
        <img
            src={src}
            alt="Logo IEQ"
            style={{
                width: `${size}px`, height: `${size}px`,
                minWidth: `${size}px`, minHeight: `${size}px`,
                borderRadius: "50%", objectFit: "cover", display: "block",
            }}
        />
    );
}

/* ─── Ícones SVG embutidos (traço fino, tom roxo) ─── */
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P.plum} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

/* ══════════ ARTE: céu crepuscular + dunas (replicado do Login) ══════════ */
const BG_STARS = [
    [96,95,1.5],[126,204,1.8],[306,204,1.5],[365,84,1.3],[196,293,1.5],[378,277,1.3],[58,358,2.4],[94,388,1.2],
    [119,463,1.5],[315,483,2.8],[620,90,3],[809,50,1.6],[943,131,1.6],[963,270,1.7],[1079,199,2.6],[1191,86,1.8],
    [1258,185,1.6],[1253,328,2.4],[1180,388,2.4],[1262,448,1.4],[1187,561,2.8],[996,466,1.3],[450,150,1.2],[700,40,1.2],
    [540,340,1.2],[880,330,1.3],[230,120,1.1],[1120,120,1.2],
];
const BG_STREAKS = [
    [1012,361,1110,262,2.4],[195,458,282,373,2.2],[1043,554,1094,501,1.8],
    [630,212,662,185,1.4],[830,270,862,244,1.4],[515,266,541,246,1.2],
];

function SceneBackground({ dark }) {
    return (
        <svg className="scene" viewBox="0 0 1344 896" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <defs>
                <linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0"   stopColor="#442B6C"/>
                    <stop offset=".30" stopColor="#6D3F77"/>
                    <stop offset=".50" stopColor="#9A5385"/>
                    <stop offset=".68" stopColor="#C56B93"/>
                    <stop offset=".85" stopColor="#E08AA1"/>
                    <stop offset="1"   stopColor="#EA94A5"/>
                </linearGradient>
                <linearGradient id="bg-dark" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#6A4381"/>
                    <stop offset="1" stopColor="#4B2A68"/>
                </linearGradient>
                <linearGradient id="bg-darkR" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#4F2D6B"/>
                    <stop offset="1" stopColor="#5E3877"/>
                </linearGradient>
                <linearGradient id="bg-lit" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F7A5A6"/>
                    <stop offset=".55" stopColor="#DD87A2"/>
                    <stop offset="1" stopColor="#A96C95"/>
                </linearGradient>
                <linearGradient id="bg-litBottom" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#B9709A"/>
                    <stop offset=".5" stopColor="#E88EA5"/>
                    <stop offset="1" stopColor="#BD7396"/>
                </linearGradient>
                <linearGradient id="bg-streak" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95"/>
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
                </linearGradient>
                <radialGradient id="bg-glow">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95"/>
                    <stop offset=".35" stopColor="#E9B6FF" stopOpacity=".55"/>
                    <stop offset="1" stopColor="#C68BFF" stopOpacity="0"/>
                </radialGradient>
            </defs>

            <rect width="1344" height="896" fill="url(#bg-sky)"/>

            <g className="twinkle">
                {BG_STARS.map(([x,y,r],i) => (
                    <g key={i}>
                        {r >= 2.4 && <circle cx={x} cy={y} r={r*3.2} fill="url(#bg-glow)"/>}
                        <circle cx={x} cy={y} r={r} fill="#fff" opacity={r>=2.4?1:.8}/>
                    </g>
                ))}
            </g>
            {BG_STREAKS.map(([x1,y1,x2,y2,w],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#bg-streak)" strokeWidth={w} strokeLinecap="round"/>
            ))}

            <path d="M0,640 C300,650 600,690 900,640 C1100,600 1250,650 1344,640 L1344,896 L0,896 Z" fill="#6A4381"/>

            {/* duna esquerda */}
            <path d="M0,610 C50,608 110,618 152,626 C205,590 245,562 262,563 C276,572 274,610 266,650 C258,700 205,745 232,800 C245,830 270,860 300,896 L0,896 Z" fill="url(#bg-dark)"/>
            <path d="M264,566 C300,600 360,655 405,702 C350,740 280,790 240,822 C215,780 235,730 262,690 C275,640 274,600 264,566 Z" fill="url(#bg-lit)"/>
            <path d="M0,896 L0,800 C60,780 130,770 165,780 C178,830 172,870 160,896 Z" fill="#4B2A68"/>
            <path d="M165,782 C200,820 250,860 282,896 L160,896 C172,860 178,820 165,782 Z" fill="url(#bg-lit)"/>

            <path d="M500,896 C560,810 690,770 800,780 C910,790 990,835 1030,896 Z" fill="url(#bg-litBottom)"/>

            {/* duna direita */}
            <path d="M900,620 C940,590 975,558 992,556 C1020,562 1035,590 1010,612 C985,628 960,640 968,655 C1000,690 1055,705 1058,745 C1058,790 1075,815 1150,840 L1344,880 L1344,896 L800,896 Z" fill="url(#bg-darkR)"/>
            <path d="M1005,563 C1100,640 1230,720 1298,762 C1250,810 1200,840 1165,850 C1100,830 1060,800 1058,745 C1055,705 1000,690 968,655 C960,640 985,628 1010,612 C1035,590 1025,565 1005,563 Z" fill="url(#bg-lit)"/>
            <path d="M1180,676 C1250,660 1310,650 1344,640 L1344,770 L1298,762 Z" fill="#5B3673"/>
            <path d="M1085,896 C1180,860 1290,800 1344,730 L1344,896 Z" fill="#5B3673"/>

            {dark && <rect width="1344" height="896" fill="#0E0620" opacity=".45"/>}
        </svg>
    );
}

/* ══════════ SEÇÃO: pílula de funcionalidade ══════════ */
export default function Home() {
    const navigate       = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const dark = theme === "dark";

    const vars = dark ? {
        "--bg":      "#1F1435",
        "--panel":   "#2A1D47",
        "--title":   "#FFFFFF",
        "--text":    "#E6DCF2",
        "--sub":     "rgba(255,255,255,.62)",
        "--card":    "#251A40",
        "--card-b":  "rgba(255,255,255,.10)",
        "--line":    "rgba(255,255,255,.12)",
        "--chipbg":  "rgba(245,152,173,.14)",
    } : {
        "--bg":      P.panel,
        "--panel":   "#EEEEF2",
        "--title":   P.ink,
        "--text":    "#4A3568",
        "--sub":     "rgba(32,10,63,.62)",
        "--card":    "#FFFFFF",
        "--card-b":  "rgba(32,10,63,.08)",
        "--line":    P.line,
        "--chipbg":  P.chip,
    };

    return (
        <>
            <Helmet>
                <title>IEQ Gestão — Sistema Eclesiástico para Igrejas em Células</title>
                <meta name="description" content="Sistema exclusivo para igrejas da IEQ. Gerencie membros, células, discipulado, agenda e financeiro em um só lugar." />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

        .ieq-home, .ieq-home *, .ieq-home *::before, .ieq-home *::after { box-sizing:border-box; }
        :where(.ieq-home, .ieq-home *) { margin:0; padding:0; }
        .ieq-home {
          font-family:'Montserrat',system-ui,sans-serif;
          background:var(--bg); color:var(--text); overflow-x:hidden;
        }
        .ieq-home button, .ieq-home a { font-family:inherit; }

        .scene { position:absolute; inset:0; width:100%; height:100%; display:block; }
        .twinkle { animation:twinkle 5s ease-in-out infinite alternate; }
        @keyframes twinkle { from{opacity:.65} to{opacity:1} }

        /* ── botão de tema (igual ao do Login) ── */
        .theme-btn {
          position:fixed; top:18px; right:18px; z-index:60;
          width:42px; height:42px; border-radius:50%; cursor:pointer;
          display:grid; place-items:center; color:#fff;
          background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.35);
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
          transition:background .2s;
        }
        .theme-btn:hover { background:rgba(255,255,255,.28); }
        .theme-btn:focus-visible { outline:2px solid #fff; outline-offset:2px; }

        /* ── nav ﬁxada ── */
        .home-nav {
          position:fixed; top:0; left:0; right:0; z-index:50;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 clamp(20px, 5vw, 80px); height:64px;
          background:rgba(32,10,63,.28);
          backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(255,255,255,.12);
        }
        .brand { display:flex; align-items:center; gap:10px; color:#fff; font-size:19px; font-weight:700; letter-spacing:.01em; }
        .brand small { display:block; font-size:9px; font-weight:600; letter-spacing:.28em; text-transform:uppercase; opacity:.75; margin-top:1px; }
        .nav-cta {
          display:inline-flex; align-items:center; gap:8px;
          padding:9px 26px; border-radius:999px; cursor:pointer;
          background:transparent; border:1.5px solid ${P.pink}; color:#fff;
          font-size:12.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
          transition:background .2s, color .2s, transform .2s;
        }
        .nav-cta:hover { background:${P.pink}; transform:translateY(-1px); }
        .nav-cta:focus-visible { outline:2px solid #fff; outline-offset:2px; }

        /* ── hero ── */
        .hero {
          position:relative; min-height:100vh; overflow:hidden;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding:90px clamp(20px,5vw,80px) 70px; color:#fff;
        }
        .hero-art { position:absolute; inset:0; }
        .hero-inner { position:relative; z-index:2; max-width:700px; }
        .logo-ring {
          width:64px; height:64px; margin:0 auto 22px; border-radius:50%;
          display:grid; place-items:center;
          background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.45);
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
        }
        .eyebrow {
          font-size:11.5px; font-weight:600; letter-spacing:.26em; text-transform:uppercase;
          color:rgba(255,255,255,.75); margin-bottom:18px;
        }
        .hero h1 {
          font-size:clamp(34px, 6vw, 64px); font-weight:800; line-height:1.08; letter-spacing:-.02em;
          text-shadow:0 2px 24px rgba(20,8,45,.6);
        }
        .hero p.sub {
          margin:22px auto 0; max-width:520px; font-size:15.5px; line-height:1.75; font-weight:500;
          color:rgba(255,255,255,.88); text-shadow:0 1px 12px rgba(20,8,45,.55);
        }
        .hero-actions { display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; margin-top:34px; }
        .btn-pill {
          display:inline-flex; align-items:center; gap:10px;
          padding:15px 34px; border-radius:999px; cursor:pointer;
          font-size:13.5px; font-weight:700; letter-spacing:.06em;
          transition:transform .2s, box-shadow .2s, background .2s;
        }
        .btn-pill:focus-visible { outline:3px solid ${P.pink}; outline-offset:2px; }
        .btn-solid { border:none; background:${P.plum}; color:#fff; box-shadow:0 14px 34px rgba(32,10,63,.4); }
        .btn-solid:hover { background:${P.plumDark}; transform:translateY(-2px); box-shadow:0 18px 42px rgba(32,10,63,.5); }
        .btn-glass { background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.45); color:#fff; backdrop-filter:blur(6px); }
        .btn-glass:hover { background:rgba(255,255,255,.24); transform:translateY(-2px); }

        .scroll-hint {
          position:absolute; left:50%; bottom:26px; transform:translateX(-50%);
          display:flex; flex-direction:column; align-items:center; gap:8px;
          font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:rgba(255,255,255,.7);
          animation:floaty 2.4s ease-in-out infinite;
        }
        .scroll-hint::after { content:""; width:1px; height:30px; background:linear-gradient(to bottom,rgba(255,255,255,.8),transparent); }
        @keyframes floaty { 0%,100%{transform:translate(-50%,0)} 50%{transform:translate(-50%,7px)} }

        /* ── faixa de números ── */
        .stats {
          display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:1px;
          max-width:960px; margin:0 auto; background:var(--line);
          border:1px solid var(--line); border-radius:16px; overflow:hidden;
        }
        .stat { text-align:center; padding:26px 14px; background:var(--card); }
        .stat b { display:block; font-size:34px; font-weight:800; color:${P.pink}; line-height:1; }
        .stat span { display:block; margin-top:8px; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--sub); }

        /* ── seções ── */
        .section { padding:96px clamp(20px,5vw,80px); }
        .section-head { text-align:center; margin-bottom:64px; }
        .section-head .eyebrow { color:${P.gold}; }
        .section-head h2 { font-size:clamp(28px,4vw,44px); font-weight:800; letter-spacing:-.015em; color:var(--title); margin-bottom:16px; }
        .section-head p { color:var(--sub); max-width:500px; margin:0 auto; font-size:15px; line-height:1.7; }

        /* ── grade de módulos ── */
        .feat-grid {
          display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:18px;
          max-width:1120px; margin:0 auto;
        }
        .feat-card {
          padding:32px 28px; border-radius:18px; background:var(--card);
          border:1px solid var(--card-b); box-shadow:0 10px 30px rgba(32,10,63,.06);
          transition:transform .25s, box-shadow .25s, border-color .25s;
        }
        .feat-card:hover { transform:translateY(-4px); box-shadow:0 20px 44px rgba(32,10,63,.14); border-color:rgba(131,77,135,.35); }
        .feat-ico {
          width:52px; height:52px; border-radius:50%; display:grid; place-items:center;
          background:var(--chipbg); color:${P.plum}; margin-bottom:20px;
          border:1px solid rgba(131,77,135,.25);
        }
        .feat-card h3 { font-size:16.5px; font-weight:700; color:var(--title); margin-bottom:9px; letter-spacing:-.01em; }
        .feat-card p { font-size:13.5px; line-height:1.7; color:var(--sub); }

        /* ── sobre / missão ── */
        .about {
          max-width:1120px; margin:0 auto; display:grid;
          grid-template-columns:1fr 1fr; gap:70px; align-items:center;
        }
        .about h2 { font-size:clamp(26px,3.5vw,40px); font-weight:800; letter-spacing:-.015em; color:var(--title); margin:0 0 22px; line-height:1.2; }
        .about > div > p, .about-note { font-size:15px; line-height:1.9; color:var(--text); }
        .about-note { margin-bottom:30px; }
        .checks { list-style:none; display:flex; flex-direction:column; gap:13px; }
        .checks li { display:flex; align-items:center; gap:11px; font-size:14px; font-weight:600; color:var(--text); }
        .check-bubble {
          width:24px; height:24px; border-radius:50%; flex-shrink:0; display:grid; place-items:center;
          background:var(--chipbg); border:1px solid rgba(131,77,135,.35);
        }

        /* ── cartão de citação (espelho do cartão do Login) ── */
        .quote-card {
          position:relative; overflow:hidden; border-radius:18px; padding:44px 38px 150px;
          background:linear-gradient(160deg, ${P.plumDeep}, ${P.plum});
          box-shadow:0 30px 70px rgba(32,10,63,.35); border:1px solid rgba(255,255,255,.14);
        }
        .quote-moon { position:absolute; top:34px; right:36px; border-radius:50%;
          background:linear-gradient(135deg,#F7AAA6,#B06F95); width:54px; height:54px; opacity:.9; box-shadow:0 0 40px rgba(255,170,166,.55); }
        .quote-q { position:absolute; top:16px; right:110px; font-size:96px; font-weight:800; color:rgba(255,255,255,.16); line-height:1; }
        .quote-card blockquote {
          font-size:19px; font-weight:600; line-height:1.7; color:#fff; font-style:italic;
          position:relative; z-index:2;
        }
        .quote-card cite { display:block; margin-top:24px; font-size:12.5px; font-style:normal; font-weight:600; color:rgba(255,255,255,.78); letter-spacing:.02em; }
        .quote-card cite b { display:block; color:#fff; font-size:14px; }
        .quote-dunes { position:absolute; left:0; right:0; bottom:0; height:140px; z-index:1; }

        /* ── CTA ── */
        .cta { text-align:center; padding:120px clamp(20px,5vw,80px); position:relative; }
        .cta-inner { position:relative; z-index:1; max-width:620px; margin:0 auto; }
        .cta h2 { font-size:clamp(28px,4.5vw,48px); font-weight:800; letter-spacing:-.02em; color:var(--title); margin:32px 0 16px; }
        .cta p { color:var(--sub); font-size:16px; line-height:1.8; margin-bottom:40px; }
        .glow {
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:700px; height:420px; border-radius:50%; pointer-events:none;
          background:radial-gradient(ellipse, rgba(131,77,135,.16) 0%, transparent 70%);
        }

        /* ── rodapé ── */
        .home-foot {
          display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:18px;
          max-width:1120px; margin:0 auto;
          padding:34px clamp(20px,5vw,80px);
        }
        .home-foot > * { flex-wrap:wrap; }
        .foot-brand { display:flex; align-items:center; gap:10px; color:#fff; font-size:15px; font-weight:700; }
        .home-foot p { font-size:12px; color:rgba(255,255,255,.66); }
        .home-foot a { color:${P.pink}; text-decoration:none; }
        .home-foot a:hover { text-decoration:underline; }

        @media (max-width:860px) {
          .about { grid-template-columns:1fr; gap:48px; }
          .hero { padding-top:110px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ieq-home *, .ieq-home *::before, .ieq-home *::after { animation:none !important; transition:none !important; }
        }
      `}</style>

            <div className="ieq-home" style={vars}>
                {/* ══════════ NAV ══════════ */}
                <nav className="home-nav">
                    <div className="brand">
                        <IEQCross size={38}/>
                        <span>
                            IEQ <span style={{ color: P.pink }}>Gestão</span>
                            <small>Portal Administrativo</small>
                        </span>
                    </div>
                    <button className="nav-cta" onClick={() => navigate("/login")}>
                        Entrar <ArrowRight size={14}/>
                    </button>
                </nav>

                {/* ══════════ HERO ══════════ */}
                <section className="hero">
                    <div className="hero-art"><SceneBackground dark={dark}/></div>

                    <div className="hero-inner">
                        <div className="logo-ring"><IEQCross size={46}/></div>
                        <p className="eyebrow">IEQ · Pituaçu</p>
                        <h1>Sua Igreja,<br/>Bem Administrada.</h1>
                        <p className="sub">
                            Gestão completa de membros, células, discipulado, agenda e
                            tesouraria — tudo em um só lugar, pensado para a realidade da sua congregação.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-pill btn-solid" onClick={() => navigate("/login")}>
                                Acessar o sistema <ArrowRight size={16}/>
                            </button>
                            <button className="btn-pill btn-glass" onClick={() => navigate("/login")}>
                                Solicitar acesso
                            </button>
                        </div>
                    </div>

                    <div className="scroll-hint">Role</div>
                </section>

                {/* ══════════ STATS ══════════ */}
                <section className="section" style={{ paddingTop: 64, paddingBottom: 64 }}>
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

                    {/* ══════════ FEATURES ══════════ */}
                    <div className="feat-grid" style={{ marginTop: 96 }}>
                        {features.map((f, i) => (
                            <FadeSection key={i} delay={(i % 3) * 80}>
                                <div className="feat-card">
                                    <div className="feat-ico">{f.icon}</div>
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                </div>
                            </FadeSection>
                        ))}
                    </div>
                </section>

                {/* ══════════ MISSÃO ══════════ */}
                <section className="section" style={{ background: "var(--panel)" }}>
                    <div className="about">
                        <FadeSection>
                            <p className="eyebrow" style={{ color: P.gold, marginBottom: 16 }}>Por que o IEQ Gestão</p>
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
                                <span className="quote-moon"/>
                                <blockquote>
                                    Finalmente um sistema que entende como funcionamos.
                                    Antes perdíamos horas com planilhas. Hoje o relatório de
                                    célula está a um clique.
                                </blockquote>
                                <cite>
                                    <b>Pastor Responsável</b>
                                    Igreja IEQ Local · Pituaçu
                                </cite>
                                <div className="quote-dunes">
                                    <svg viewBox="0 0 720 144" preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block" }} aria-hidden="true">
                                        <path d="M0,144 C90,132 190,88 250,84 C318,126 430,142 520,128 C600,116 660,132 720,120 L720,144 Z" fill="#4B2A68" opacity=".55"/>
                                        <path d="M0,144 C120,138 240,104 300,98 C370,136 470,146 560,134 C640,124 690,138 720,130 L720,144 Z" fill="#3F2257" opacity=".8"/>
                                    </svg>
                                </div>
                            </div>
                        </FadeSection>
                    </div>
                </section>

                {/* ══════════ CTA FINAL ══════════ */}
                <section className="cta">
                    <div className="glow"/>
                    <FadeSection className="cta-inner">
                        <Divider/>
                        <h2>Pronto para começar?</h2>
                        <p>
                            Acesse o sistema agora e experimente uma gestão
                            mais organizada para a sua congregação.
                        </p>
                        <button className="btn-pill btn-solid" style={{ position: "relative", zIndex: 2 }} onClick={() => navigate("/login")}>
                            Entrar no Sistema <ArrowRight size={16}/>
                        </button>
                    </FadeSection>
                </section>

                {/* ══════════ FOOTER ══════════ */}
                <footer style={{ background: "#241643", borderTop: "1px solid rgba(255,255,255,.1)" }}>
                    <div className="home-foot">
                        <div className="foot-brand">
                            <IEQCross size={34}/>
                            <span>IEQ <span style={{ color: P.pink }}>Gestão</span></span>
                        </div>
                        <p style={{ textAlign: "center" }}>
                            © {new Date().getFullYear()} IEQ Gestão — Sistema Eclesiástico. Suporte:{" "}
                            <a href="mailto:washquesia@gmail.com">washquesia@gmail.com</a>
                        </p>
                        <p>Uso exclusivo da IEQ</p>
                    </div>
                </footer>

                <button className="theme-btn" onClick={toggleTheme} aria-label="Alternar tema">
                    {dark ? <Sun size={19}/> : <Moon size={19}/>}
                </button>
            </div>
        </>
    );
}
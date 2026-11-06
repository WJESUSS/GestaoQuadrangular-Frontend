import { Helmet }        from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    ArrowRight, BookOpen, ChevronDown, Cross, LogIn, Mail, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
    { id: "doutrina",        label: "Doutrina" },
    { id: "simbolismo",      label: "Simbolismo" },
    { id: "filho-do-homem",  label: "Filho do Homem" },
    { id: "salvacao",        label: "Salvação" },
    { id: "convite",         label: "Convite" },
];

const SIMBOLOS = [
    {
        num: "01",
        titulo: "Rosto do Homem",
        texto: "Representa Jesus Cristo como Filho do Homem, aquele que veio ao mundo para salvar a humanidade.",
        img: "/images/jesus-rosto.jpg",
        alt: "Rosto de Jesus Cristo, o Filho do Homem",
        pos: "50% 13%",
    },
    {
        num: "02",
        titulo: "Evangelho de Lucas",
        texto: "O Evangelho de Lucas apresenta Jesus como o Salvador que veio buscar e salvar os perdidos.",
        img: "/images/biblia.jpg",
        alt: "Bíblia aberta sobre a mesa",
    },
    {
        num: "03",
        titulo: "A Cruz",
        texto: "Símbolo da salvação, representando o sacrifício de Jesus Cristo pela humanidade.",
        img: "/images/cruz-salvacao.jpg",
        alt: "Cruz cristã em silhueta contra o céu do pôr do sol",
    },
    {
        num: "04",
        titulo: "Cor Escarlate",
        texto: "Representa o sangue de Jesus Cristo derramado por nós, simbolizando redenção e salvação.",
        img: null,
        alt: "",
    },
];

const SALVACAO_PONTOS = [
    { n: "1", titulo: "Todos pecaram.", ref: "ROMANOS 3:23" },
    { n: "2", titulo: "Precisamos crer em Jesus.", ref: "ATOS 16:31" },
    { n: "3", titulo: "Jesus morreu e ressuscitou.", ref: "ROMANOS 8:34" },
    { n: "4", titulo: "Jesus nos liberta do pecado e da morte.", ref: "ROMANOS 8:2" },
];

const ACCENTS = [
    { bg: "#FF7A00", ink: "#2A0306" },
    { bg: "#FFD400", ink: "#2A0306" },
    { bg: "#1E4FD8", ink: "#FFFFFF" },
    { bg: "#C2187A", ink: "#FFFFFF" },
];

function Reveal({ children, delay = 0, className = "", style = {} }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("is-visible");
                    obs.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (
        <div ref={ref} className={`reveal ${className}`} style={{ "--d": `${delay}ms`, ...style }}>
            {children}
        </div>
    );
}

function LogoIEQ({ size = 40 }) {
    return (
        <img
            src="/images/quadrangular.png"
            alt="Logotipo da Igreja do Evangelho Quadrangular"
            width={size}
            height={size}
            style={{ width: size, height: size, minWidth: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
        />
    );
}

function DropMark() {
    return (
        <svg viewBox="0 0 120 150" className="drop-svg" role="img" aria-label="Gota de sangue escarlate">
            <rect width="120" height="150" fill="#8F0009" />
            <path d="M60 18 C60 18 26 70 26 100 a34 34 0 0 0 68 0 C94 70 60 18 60 18 Z"
                  fill="#E30613" stroke="rgba(255,255,255,.4)" strokeWidth="1.4" />
            <ellipse cx="47" cy="88" rx="7" ry="12" fill="rgba(255,255,255,.5)" transform="rotate(-25 47 88)" />
        </svg>
    );
}

function Flag() {
    return (
        <span className="jc-flag" aria-hidden="true">
            <i className="c-orange" /><i className="c-yellow" /><i className="c-blue" /><i className="c-magenta" />
        </span>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen]       = useState(false);
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        const sections = NAV_ITEMS.map(item => document.getElementById(item.id)).filter(Boolean);
        if (!sections.length) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); }),
            { rootMargin: "-38% 0px -55% 0px", threshold: 0 }
        );
        sections.forEach(section => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        const onKey = event => { if (event.key === "Escape") setMenuOpen(false); };
        const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
        window.addEventListener("keydown", onKey);
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("resize", onResize);
        };
    }, [menuOpen]);

    const year = new Date().getFullYear();

    return (
        <>
            <Helmet>
                <title>Jesus Cristo Salva — Primeira Doutrina Quadrangular | IEQ Pituaçu</title>
                <meta name="description" content="Conheça a primeira doutrina da Igreja do Evangelho Quadrangular: Jesus Cristo Salva. Porque o Filho do Homem veio buscar e salvar o que se havia perdido. Lucas 19:10." />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="Jesus Cristo Salva — Primeira Doutrina Quadrangular" />
                <meta property="og:description" content="Jesus veio ao mundo para buscar e salvar aquilo que estava perdido. Lucas 19:10." />
                <meta property="og:image" content="/images/jesus-salva.jpg" />
                <meta property="og:type" content="website" />
            </Helmet>

            <style>{`
        .jc-home {
          --red:#E30613; --red-mid:#B5000F; --red-dark:#8F0009; --red-deep:#3D0004;
          --glow:#FF5A64; --orange:#FF7A00; --yellow:#FFD400; --blue:#1E4FD8; --magenta:#C2187A;
          --white:#FFFFFF; --ink:#2A0306;
          --white-78:rgba(255,255,255,.78); --white-60:rgba(255,255,255,.6); --white-35:rgba(255,255,255,.35);
          --nav-h:74px;
          position:relative; min-height:100vh; overflow-x:hidden;
          font-family:'Inter',system-ui,sans-serif; color:var(--white); background:var(--red);
        }
        .jc-home, .jc-home *, .jc-home *::before, .jc-home *::after { box-sizing:border-box; }
        :where(.jc-home, .jc-home *) { margin:0; padding:0; }
        .jc-home button, .jc-home a { font-family:inherit; }
        .jc-home button { cursor:pointer; }
        .jc-home ::selection { background:var(--yellow); color:var(--ink); }
        .jc-home :is(a,button):focus-visible { outline:3px solid var(--yellow); outline-offset:3px; }

        .jc-home section[id] { scroll-margin-top:calc(var(--nav-h) + 14px); }

        .jc-flag { display:flex; width:100%; height:6px; }
        .jc-flag i { display:block; flex:1; }
        .c-orange { background:var(--orange); }
        .c-yellow { background:var(--yellow); }
        .c-blue { background:var(--blue); }
        .c-magenta { background:var(--magenta); }

        .jc-cross { position:absolute; z-index:0; pointer-events:none; opacity:.1; }
        .jc-cross::before { content:""; position:absolute; left:50%; top:0; width:30%; height:100%; background:#fff; transform:translateX(-50%); }
        .jc-cross::after { content:""; position:absolute; top:50%; left:0; width:100%; height:30%; background:#fff; transform:translateY(-50%); }
        .jc-section-cross { right:2%; top:50%; width:180px; height:280px; transform:translateY(-50%); }

        .jc-hero-squares { position:absolute; z-index:2; top:calc(var(--nav-h) + 30px); right:clamp(18px,5vw,64px); display:grid; grid-template-columns:repeat(2,20px); gap:6px; }
        .jc-hero-squares span { display:block; width:20px; height:20px; }
        .jc-hero-squares span:nth-child(1) { background:var(--orange); }
        .jc-hero-squares span:nth-child(2) { background:var(--yellow); }
        .jc-hero-squares span:nth-child(3) { background:var(--blue); }
        .jc-hero-squares span:nth-child(4) { background:var(--magenta); }

        .jc-dots { display:inline-flex; gap:5px; }
        .jc-dots i { display:block; width:9px; height:9px; }
        .jc-dots i:nth-child(1) { background:var(--orange); }
        .jc-dots i:nth-child(2) { background:var(--yellow); }
        .jc-dots i:nth-child(3) { background:var(--blue); }
        .jc-dots i:nth-child(4) { background:var(--magenta); }

        .reveal { opacity:0; transform:translateY(34px);
          transition:opacity .8s ease var(--d,0ms), transform .8s cubic-bezier(.22,1,.36,1) var(--d,0ms); }
        .reveal.is-visible { opacity:1; transform:none; }

        .hero-rise { animation:jc-rise .9s cubic-bezier(.22,1,.36,1) both; }
        @keyframes jc-rise { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:none; } }

        /* ═══════════ CABEÇALHO ═══════════ */
        .jc-nav {
          position:fixed; top:0; left:0; right:0; z-index:60; height:var(--nav-h);
          display:flex; align-items:center; justify-content:space-between; gap:20px;
          padding:6px clamp(18px,4vw,44px) 0;
          background:var(--red-dark);
          border-bottom:2px solid rgba(255,255,255,.18);
        }
        .jc-nav .jc-flag { position:absolute; top:0; left:0; right:0; height:6px; }
        .jc-brand { display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; flex-shrink:0; }
        .jc-brand img { border:2px solid #fff; }
        .jc-brand-text { display:flex; flex-direction:column; line-height:1.1; }
        .jc-brand-text strong { font-size:15px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; color:#fff; }
        .jc-brand-text small { font-size:8.5px; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:var(--white-60); margin-top:4px; }

        .jc-menu { display:flex; align-items:center; gap:2px; list-style:none; }
        .jc-link {
          position:relative; display:inline-flex; align-items:center; height:40px; padding:0 14px;
          font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--white-78);
          text-decoration:none; transition:color .2s, background .2s;
        }
        .jc-link::after {
          content:""; position:absolute; left:14px; right:14px; bottom:4px; height:4px;
          background:var(--yellow); opacity:0; transform:scaleX(.4); transition:opacity .2s, transform .2s;
        }
        .jc-link:hover { color:#fff; }
        .jc-link:hover::after { opacity:.6; transform:scaleX(.8); }
        .jc-link.active { color:var(--yellow); }
        .jc-link.active::after { opacity:1; transform:scaleX(1); }

        .jc-entrar {
          display:inline-flex; align-items:center; gap:8px; height:42px; padding:0 22px;
          border:2px solid var(--yellow); border-radius:0; background:var(--yellow); color:var(--ink);
          font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; flex-shrink:0;
          box-shadow:4px 4px 0 var(--red-deep);
          transition:transform .2s, box-shadow .2s;
        }
        .jc-entrar:hover { transform:translate(-2px,-2px); box-shadow:6px 6px 0 var(--red-deep); }

        .jc-burger { display:none; width:42px; height:42px; border:2px solid #fff; border-radius:0;
          background:transparent; color:#fff; align-items:center; justify-content:center; }

        .jc-mobile {
          display:none; position:fixed; top:var(--nav-h); left:0; right:0; z-index:59;
          background:var(--red-dark); border-bottom:4px solid var(--yellow);
          padding:18px clamp(18px,4vw,32px) 26px;
          animation:jc-menu-in .28s cubic-bezier(.22,1,.36,1);
        }
        @keyframes jc-menu-in { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:none; } }
        .jc-mobile a.jc-mlink {
          display:flex; align-items:center; justify-content:space-between; padding:15px 4px;
          border-bottom:1px solid rgba(255,255,255,.14); color:var(--white-78);
          font-size:14px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; text-decoration:none;
        }
        .jc-mobile a.jc-mlink.active { color:var(--yellow); }
        .jc-mobile .jc-entrar { width:100%; justify-content:center; margin-top:18px; height:50px; font-size:12px; }

        /* ═══════════ HERO ═══════════ */
        .jc-hero {
          position:relative; min-height:min(96svh, 1060px); display:flex; align-items:center; overflow:hidden;
          background:var(--red); border-bottom:6px solid var(--red-dark);
        }
        .jc-hero-media { position:absolute; inset:0; z-index:0; }
        .jc-hero-media img {
          width:100%; height:100%; object-fit:cover; object-position:50% 16%;
          filter:grayscale(1) contrast(1.15) brightness(.62) blur(2px);
        }
        .jc-hero-media::after { content:""; position:absolute; inset:0; background:var(--red); mix-blend-mode:multiply; }
        .jc-hero-tint { position:absolute; inset:0; z-index:1;
          background:
            radial-gradient(closest-side at 58% 46%, rgba(255,90,100,.55), rgba(255,90,100,0) 62%),
            linear-gradient(90deg, rgba(143,0,9,.9) 0%, rgba(227,6,19,.38) 46%, rgba(143,0,9,.74) 100%);
          box-shadow:inset 0 0 220px 70px rgba(61,0,4,.72); }
        .jc-hero-cross { top:50%; right:5%; width:min(38vw,420px); height:min(54vh,560px); transform:translateY(-50%); }

        .jc-hero-inner {
          position:relative; z-index:2; width:100%; max-width:1240px; margin:0 auto;
          padding:calc(var(--nav-h) + clamp(24px,5vh,56px)) clamp(18px,4.5vw,56px) clamp(72px,10vh,110px);
        }
        .jc-hero-content { max-width:660px; }

        .eyebrow { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .eyebrow-text { display:flex; align-items:center; gap:9px; font-size:.7rem; font-weight:800;
          letter-spacing:.26em; text-transform:uppercase; color:#fff; }

        .jc-hero-title { margin-top:24px; font-family:'Anton','Inter',sans-serif; font-weight:400;
          text-transform:uppercase; line-height:.9; letter-spacing:.005em; }
        .jc-hero-title .l1 { display:block; font-size:clamp(3rem,8.2vw,6.2rem); color:#fff;
          text-shadow:5px 5px 0 var(--red-dark); }
        .jc-hero-title .l2 { display:block; font-size:clamp(4.4rem,12.6vw,8.6rem); color:#fff;
          text-shadow:6px 6px 0 var(--red-dark); }

        .jc-hero-desc { margin-top:26px; font-size:clamp(1.04rem,1.4vw,1.2rem); line-height:1.7;
          color:#fff; max-width:30rem; font-weight:500; }

        .jc-hero-verse { margin-top:26px; padding-left:18px; border-left:6px solid var(--yellow); max-width:32rem; }
        .jc-hero-verse blockquote { font-size:clamp(.98rem,1.25vw,1.1rem); line-height:1.6;
          color:#fff; font-weight:600; }
        .jc-hero-verse figcaption { margin-top:10px; font-size:.7rem; font-weight:800; letter-spacing:.24em;
          color:var(--yellow); text-transform:uppercase; }

        .jc-hero-actions { display:flex; gap:16px; flex-wrap:wrap; margin-top:34px; }
        .btn {
          display:inline-flex; align-items:center; justify-content:center; gap:10px;
          height:54px; padding:0 28px; border-radius:0; font-size:.76rem; font-weight:800;
          letter-spacing:.12em; text-transform:uppercase; text-decoration:none; border:2px solid transparent;
          transition:transform .2s, box-shadow .2s, background .2s, color .2s;
        }
        .btn-primary { background:var(--yellow); color:var(--ink); border-color:var(--yellow);
          box-shadow:7px 7px 0 var(--red-dark); }
        .btn-primary:hover { transform:translate(-2px,-2px); box-shadow:10px 10px 0 var(--red-dark); }
        .btn-ghost { background:transparent; color:#fff; border-color:#fff;
          box-shadow:7px 7px 0 rgba(61,0,4,.9); }
        .btn-ghost:hover { background:#fff; color:var(--red-dark); transform:translate(-2px,-2px);
          box-shadow:10px 10px 0 rgba(61,0,4,.9); }

        .jc-stamp { position:absolute; z-index:2; right:clamp(24px,6vw,82px); bottom:clamp(92px,15vh,160px);
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
          padding:14px 20px; background:var(--yellow); color:var(--ink); transform:rotate(-5deg);
          box-shadow:8px 8px 0 var(--red-dark); }
        .jc-stamp span { font-size:.6rem; font-weight:800; letter-spacing:.26em; }
        .jc-stamp strong { font-family:'Anton',sans-serif; font-size:2.1rem; line-height:1; }

        .jc-scroll { position:absolute; z-index:2; left:0; right:0; bottom:22px; display:flex;
          flex-direction:column; align-items:center; gap:6px; color:rgba(255,255,255,.6);
          font-size:.62rem; letter-spacing:.34em; text-transform:uppercase; }
        .jc-scroll svg { animation:jc-bounce 2.2s ease-in-out infinite; color:var(--yellow); opacity:.9; }
        @keyframes jc-bounce { 0%,100% { transform:translateY(0); opacity:.6 } 50% { transform:translateY(9px); opacity:1 } }

        /* ═══════════ SEÇÕES BASE ═══════════ */
        .jc-section { position:relative; padding:clamp(76px,10vh,116px) clamp(18px,4.5vw,56px); overflow:hidden; }
        .jc-inner { max-width:1240px; margin:0 auto; position:relative; z-index:1; }
        .jc-kicker { display:flex; align-items:center; gap:10px; font-size:.7rem; font-weight:800;
          letter-spacing:.26em; text-transform:uppercase; color:var(--yellow); }
        .jc-kicker::before { content:""; width:12px; height:12px; background:currentColor; flex:0 0 auto; }
        .jc-kicker::after { content:""; width:40px; height:4px; background:currentColor; }
        .jc-h2 { font-family:'Anton','Inter',sans-serif; font-weight:400; text-transform:uppercase;
          letter-spacing:.005em; font-size:clamp(2.1rem,4.8vw,3.7rem); line-height:.98; color:#fff;
          margin-top:14px; text-shadow:4px 4px 0 rgba(61,0,4,.35); }

        /* ═══════════ SEÇÃO DOUTRINA ═══════════ */
        .sec-doutrina { background:var(--red-mid); }
        .doutrina-grid { display:grid; grid-template-columns:1.02fr .98fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .doutrina-texto p { margin-top:16px; font-size:1rem; line-height:1.8; color:var(--white-78); max-width:34rem; }
        .verse-box {
          margin-top:26px; background:var(--red-dark); border:2px solid rgba(255,255,255,.14);
          border-left:8px solid var(--yellow); padding:20px 24px;
          box-shadow:8px 8px 0 var(--red-deep); max-width:34rem;
        }
        .verse-box blockquote { font-size:1.02rem; line-height:1.6; color:#fff; font-weight:600; }
        .verse-box cite { display:block; margin-top:10px; font-style:normal; font-size:.7rem; font-weight:800;
          letter-spacing:.24em; color:var(--yellow); }

        .salvador-card {
          position:relative; min-height:520px; overflow:hidden; display:flex; align-items:flex-end;
          border:3px solid #fff; box-shadow:12px 12px 0 var(--red-dark); isolation:isolate;
        }
        .salvador-card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
          object-position:50% 22%; z-index:-1; filter:grayscale(1) contrast(1.1) brightness(.66); }
        .salvador-card::after { content:""; position:absolute; inset:0; z-index:0;
          background:var(--red); mix-blend-mode:multiply; }
        .salvador-veil { position:absolute; inset:0; z-index:0;
          background:linear-gradient(180deg, rgba(143,0,9,.12) 0%, rgba(61,0,4,.9) 100%); }
        .salvador-body { position:relative; z-index:1; padding:26px 28px 28px; }
        .salvador-rule { width:52px; height:6px; background:var(--yellow); margin-bottom:14px; }
        .salvador-badge { display:inline-block; margin-bottom:14px; padding:7px 14px; background:var(--yellow);
          color:var(--ink); font-size:.62rem; font-weight:800; letter-spacing:.2em; }
        .salvador-body h3 { font-family:'Anton',sans-serif; font-weight:400; text-transform:uppercase;
          font-size:2rem; line-height:1; color:#fff; }
        .salvador-body p { margin-top:12px; font-size:.92rem; line-height:1.7; color:var(--white-78); max-width:26rem; }

        /* ═══════════ SIMBOLISMO ═══════════ */
        .sec-simbolismo { background:var(--red); }
        .sec-sub { margin-top:14px; color:var(--white-78); font-size:.98rem; line-height:1.7; max-width:34rem; }

        .sym-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:46px; }
        .sym-card {
          display:flex; flex-direction:column; height:100%; overflow:hidden;
          background:var(--red-mid); border:2px solid rgba(255,255,255,.16);
          border-top:8px solid var(--accent,var(--yellow));
          box-shadow:10px 10px 0 var(--red-dark);
          transition:transform .2s, box-shadow .2s;
        }
        .sym-card:hover { transform:translate(-2px,-2px); box-shadow:14px 14px 0 var(--red-dark); }
        .sym-media { position:relative; height:170px; overflow:hidden; background:var(--red-dark); }
        .sym-media img { width:100%; height:100%; object-fit:cover; object-position:var(--sym-pos,50% 18%);
          filter:grayscale(1) contrast(1.08) brightness(.72);
          transition:transform .6s cubic-bezier(.22,1,.36,1); }
        .sym-media::after { content:""; position:absolute; inset:0; background:var(--red);
          mix-blend-mode:multiply; }
        .sym-card:hover .sym-media img { transform:scale(1.06); }
        .sym-drop { display:grid; place-items:center; height:170px; background:var(--red-dark); }
        .drop-svg { width:96px; height:120px; }
        .sym-body { display:flex; flex-direction:column; padding:18px 18px 22px; flex:1; }
        .sym-num {
          display:inline-flex; align-items:center; justify-content:center; align-self:flex-start;
          min-width:48px; height:38px; padding:0 10px; background:var(--accent,var(--yellow));
          color:var(--accent-ink,var(--ink)); font-family:'Anton',sans-serif; font-size:1.2rem; line-height:1;
        }
        .sym-rule { width:34px; height:4px; margin:12px 0 10px; background:var(--accent,var(--yellow)); }
        .sym-body h3 { font-size:1rem; font-weight:800; color:#fff; letter-spacing:.04em; text-transform:uppercase; }
        .sym-body p { margin-top:8px; font-size:.85rem; line-height:1.65; color:var(--white-78); }

        /* ═══════════ FILHO DO HOMEM ═══════════ */
        .sec-filho { background:var(--red-dark); }
        .filho-grid { display:grid; grid-template-columns:1.05fr .95fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .filho-texto p { margin-top:16px; color:var(--white-78); font-size:1rem; line-height:1.8; max-width:33rem; }

        .verse-card {
          position:relative; margin-top:18px; padding:20px 22px 18px 64px;
          background:var(--red-mid); border:2px solid rgba(255,255,255,.14);
          border-left:8px solid var(--yellow); box-shadow:8px 8px 0 var(--red-deep);
        }
        .verse-quote { position:absolute; top:2px; left:18px; font-family:'Anton',sans-serif;
          font-size:3.6rem; line-height:1; color:var(--yellow); user-select:none; }
        .verse-ref { display:inline-block; font-size:.64rem; font-weight:800; letter-spacing:.26em; color:var(--yellow); }
        .verse-card blockquote { margin-top:8px; font-size:.99rem; line-height:1.66; color:#fff; font-weight:600; }

        .film-frame { position:relative; max-width:430px; justify-self:center; width:100%; }
        .film-panel-wrap { position:relative; z-index:1; }
        .film-panel { overflow:hidden; border:3px solid #fff; box-shadow:12px 12px 0 var(--red-mid); }
        .film-panel img { display:block; width:100%; height:100%; object-fit:cover; aspect-ratio:16/9.4; }
        .film-corner { position:absolute; width:26px; height:26px; z-index:2; border:0 solid var(--yellow); }
        .film-corner.tl { top:-3px; left:-3px; border-top-width:3px; border-left-width:3px; }
        .film-corner.tr { top:-3px; right:-3px; border-top-width:3px; border-right-width:3px; }
        .film-corner.bl { bottom:-3px; left:-3px; border-bottom-width:3px; border-left-width:3px; }
        .film-corner.br { bottom:-3px; right:-3px; border-bottom-width:3px; border-right-width:3px; }
        .film-caption { position:relative; z-index:1; margin-top:18px; text-align:center; font-size:.64rem;
          font-weight:700; letter-spacing:.26em; text-transform:uppercase; color:var(--white-60); }

        /* ═══════════ SALVAÇÃO ═══════════ */
        .sec-salvacao { background:var(--red); }
        .sec-salvacao .jc-kicker { color:var(--yellow); justify-content:center; }
        .sec-salvacao .salvacao-head { text-align:center; }
        .sec-salvacao .jc-h2 { color:#fff; }

        .why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:50px; }
        .why-card {
          height:100%; padding:24px 20px 22px; background:var(--red-mid);
          border:2px solid rgba(255,255,255,.16); border-top:8px solid var(--accent,var(--yellow));
          box-shadow:10px 10px 0 var(--red-dark);
          transition:transform .2s, box-shadow .2s;
        }
        .why-card:hover { transform:translate(-2px,-2px); box-shadow:14px 14px 0 var(--red-dark); }
        .why-num {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:56px; height:46px; padding:0 10px; background:var(--accent,var(--yellow));
          color:var(--accent-ink,var(--ink)); font-family:'Anton',sans-serif; font-size:1.5rem; line-height:1;
        }
        .why-card h3 { margin-top:14px; font-size:.95rem; font-weight:800; line-height:1.45; color:#fff;
          text-transform:uppercase; letter-spacing:.03em; min-height:2.8em; }
        .why-ref { display:inline-block; margin-top:16px; padding:6px 12px;
          border:2px solid var(--yellow); color:var(--yellow);
          font-size:.62rem; font-weight:800; letter-spacing:.16em; }

        .salvacao-quote { margin:50px auto 0; max-width:46rem; text-align:center; }
        .salvacao-quote .rule { width:88px; height:6px; margin:0 auto; background:var(--yellow); }
        .salvacao-quote p { font-size:clamp(1.1rem,2.1vw,1.45rem); font-weight:600;
          line-height:1.55; color:#fff; padding:22px 12px; }

        /* ═══════════ CONVITE ═══════════ */
        .sec-convite { background:var(--red-mid); }
        .sec-convite .jc-h2 { color:#fff; }
        .sec-convite .jc-h2 em { font-style:normal; color:#fff;
          text-decoration:underline; text-decoration-color:var(--yellow);
          text-decoration-thickness:8px; text-underline-offset:6px; }
        .convite-grid { display:grid; grid-template-columns:1.02fr .98fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .convite-texto p { margin-top:16px; font-size:1rem; line-height:1.8; color:var(--white-78); max-width:32rem; }
        .btn-convite {
          margin-top:30px; height:58px; padding:0 32px; border:2px solid var(--yellow); border-radius:0;
          background:var(--yellow); color:var(--ink); font-size:.78rem; font-weight:800; letter-spacing:.1em;
          box-shadow:8px 8px 0 var(--red-deep); display:inline-flex; align-items:center; gap:12px;
          text-transform:uppercase; transition:transform .2s, box-shadow .2s;
        }
        .btn-convite:hover { transform:translate(-2px,-2px); box-shadow:11px 11px 0 var(--red-deep); }

        .convite-frame { position:relative; max-width:460px; justify-self:center; width:100%; }
        .convite-frame figure { position:relative; z-index:1; overflow:hidden;
          border:3px solid #fff; box-shadow:12px 12px 0 var(--red-dark); }
        .convite-frame figure::after { content:""; position:absolute; inset:0; background:var(--red);
          mix-blend-mode:multiply; pointer-events:none; }
        .convite-frame img { display:block; width:100%; aspect-ratio:4/4.6; object-fit:cover; object-position:50% 42%; }
        .convite-chip { position:absolute; z-index:2; right:-14px; bottom:26px; display:flex; align-items:center; gap:10px;
          padding:12px 18px; background:var(--yellow); color:var(--ink);
          box-shadow:6px 6px 0 var(--red-dark); }
        .convite-chip svg { color:var(--ink); flex-shrink:0; }
        .convite-chip strong { display:block; font-size:.78rem; color:var(--ink); letter-spacing:.04em; }
        .convite-chip small { display:block; font-size:.6rem; font-weight:700; letter-spacing:.2em; color:var(--red-dark); margin-top:2px; text-transform:uppercase; }

        /* ═══════════ RODAPÉ ═══════════ */
        .jc-footer { position:relative; background:var(--red-dark); }
        .jc-footer .jc-flag { height:8px; }
        .jc-footer-inner { max-width:1240px; margin:0 auto; padding:56px clamp(18px,4.5vw,56px) 0; }
        .jc-footer-grid { display:grid; grid-template-columns:1.35fr 1fr 1fr; gap:40px; }
        .jc-foot-brand { display:flex; align-items:center; gap:12px; }
        .jc-foot-brand img { border:2px solid #fff; }
        .jc-foot-brand strong { display:block; font-size:15px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; color:#fff; }
        .jc-foot-brand small { display:block; font-size:8px; letter-spacing:.22em; text-transform:uppercase; color:var(--white-60); margin-top:4px; }
        .jc-foot-verse { margin-top:18px; padding-left:16px; border-left:4px solid var(--yellow);
          font-size:.9rem; line-height:1.65; color:var(--white-78); font-style:italic; }
        .jc-foot-verse cite { display:block; margin-top:8px; font-style:normal; font-family:'Inter';
          font-size:.62rem; font-weight:800; letter-spacing:.24em; color:var(--yellow); }
        .jc-foot-doctr { margin-top:14px; font-size:.8rem; color:var(--white-60); letter-spacing:.04em; }
        .jc-foot-h { font-size:.66rem; font-weight:800; letter-spacing:.26em; text-transform:uppercase; color:var(--yellow); }
        .jc-foot-list { list-style:none; margin-top:14px; display:flex; flex-direction:column; gap:10px; }
        .jc-foot-list a { display:inline-flex; align-items:center; gap:8px; color:var(--white-78);
          font-size:.85rem; text-decoration:none; transition:color .2s; }
        .jc-foot-list a:hover { color:var(--yellow); }
        .jc-footer-bar { margin-top:44px; border-top:2px solid rgba(255,255,255,.16);
          padding:20px 0 24px; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; }
        .jc-footer-bar p { font-size:.74rem; color:var(--white-60); }
        .jc-footer-bar a { color:var(--yellow); text-decoration:none; }
        .jc-footer-bar a:hover { text-decoration:underline; }

        /* ═══════════ RESPONSIVO ═══════════ */
        @media (max-width:1100px) {
          .sym-grid { grid-template-columns:repeat(2,1fr); }
          .why-grid { grid-template-columns:repeat(2,1fr); }
          .why-card h3 { min-height:0; }
          .jc-stamp { display:none; }
        }
        @media (max-width:1024px) {
          .jc-menu { display:none; }
          .jc-burger { display:inline-flex; }
          .jc-mobile.open { display:block; }
        }
        @media (max-width:900px) {
          .doutrina-grid, .filho-grid, .convite-grid { grid-template-columns:1fr; }
          .salvador-card { min-height:420px; }
          .convite-frame { max-width:400px; }
          .film-frame { max-width:400px; }
          .jc-footer-grid { grid-template-columns:1fr; gap:28px; }
          .jc-hero-cross { right:-12%; width:60vw; height:56vh; opacity:.07; }
          .jc-section-cross { display:none; }
          .jc-hero-media img { object-position:50% 12%; }
          .jc-hero { min-height:auto; }
          .jc-hero-inner { padding-top:calc(var(--nav-h) + 44px); padding-bottom:104px; }
        }
        @media (max-width:600px) {
          .jc-hero-squares { display:none; }
          .eyebrow-text { font-size:.6rem; letter-spacing:.16em; }
          .jc-hero-title .l1 { font-size:clamp(2.4rem,11vw,3.4rem); }
          .jc-hero-title .l2 { font-size:clamp(3.6rem,17vw,5rem); }
          .btn-convite { font-size:.68rem; letter-spacing:.06em; padding:0 18px; height:54px; }
          .sym-grid { grid-template-columns:1fr; }
          .why-grid { grid-template-columns:1fr; }
          .jc-brand-text small { display:none; }
          .jc-entrar { height:38px; padding:0 14px; font-size:10.5px; }
          .jc-hero-actions { flex-direction:column; align-items:stretch; }
          .jc-hero-actions .btn { width:100%; }
          .convite-chip { right:8px; }
          .jc-footer-bar { flex-direction:column; text-align:center; justify-content:center; }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity:1 !important; transform:none !important; transition:none !important; }
          .hero-rise { animation:none !important; }
          .jc-scroll svg { animation:none; }
          .jc-mobile { animation:none; }
        }
      `}</style>

            <div className="jc-home">

                {/* ═══════════ CABEÇALHO ═══════════ */}
                <header className="jc-nav">
                    <Flag />
                    <a className="jc-brand" href="#inicio" aria-label="Igreja do Evangelho Quadrangular — início">
                        <LogoIEQ size={42} />
                        <span className="jc-brand-text">
                            <strong>IEQ Pituaçu</strong>
                            <small>Igreja do Evangelho Quadrangular</small>
                        </span>
                    </a>

                    <nav aria-label="Navegação principal">
                        <ul className="jc-menu">
                            {NAV_ITEMS.map(item => (
                                <li key={item.id}>
                                    <a
                                        className={`jc-link${activeSection === item.id ? " active" : ""}`}
                                        href={`#${item.id}`}
                                        aria-current={activeSection === item.id ? "true" : undefined}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <button className="jc-entrar" onClick={() => navigate("/login")}>
                        <LogIn size={15} strokeWidth={2.6} /> Entrar
                    </button>

                    <button
                        className="jc-burger"
                        onClick={() => setMenuOpen(open => !open)}
                        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={menuOpen}
                        aria-controls="jc-mobile-menu"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </header>

                <div className={`jc-mobile${menuOpen ? " open" : ""}`} id="jc-mobile-menu">
                    {NAV_ITEMS.map(item => (
                        <a
                            key={item.id}
                            className={`jc-mlink${activeSection === item.id ? " active" : ""}`}
                            href={`#${item.id}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {item.label}
                            <ArrowRight size={16} />
                        </a>
                    ))}
                    <button className="jc-entrar" onClick={() => { setMenuOpen(false); navigate("/login"); }}>
                        <LogIn size={16} strokeWidth={2.6} /> Entrar no Sistema
                    </button>
                </div>

                <main id="inicio">
                    {/* ═══════════ HERO ═══════════ */}
                    <section className="jc-hero" aria-label="Jesus Cristo Salva — Primeira Doutrina Quadrangular">
                        <div className="jc-hero-media">
                            <img
                                src="/images/jesus-rosto.jpg"
                                alt="Rosto de Jesus Cristo em perfil, iluminado em tons avermelhados, olhando para o alto"
                            />
                        </div>
                        <div className="jc-hero-tint" />
                        <div className="jc-cross jc-hero-cross" aria-hidden="true" />
                        <div className="jc-hero-squares" aria-hidden="true">
                            <span /><span /><span /><span />
                        </div>

                        <div className="jc-hero-inner">
                            <div className="jc-hero-content">
                                <div className="eyebrow hero-rise">
                                    <span className="jc-dots" aria-hidden="true"><i /><i /><i /><i /></span>
                                    <span className="eyebrow-text"><Cross size={13} strokeWidth={2.6} /> Primeira Doutrina Quadrangular</span>
                                </div>

                                <h1 className="jc-hero-title">
                                    <span className="l1 hero-rise" style={{ animationDelay: "120ms" }}>JESUS CRISTO</span>
                                    <span className="l2 hero-rise" style={{ animationDelay: "240ms" }}>SALVA!</span>
                                </h1>

                                <p className="jc-hero-desc hero-rise" style={{ animationDelay: "360ms" }}>
                                    Jesus veio ao mundo para buscar e salvar aquilo que estava perdido.
                                </p>

                                <figure className="jc-hero-verse hero-rise" style={{ animationDelay: "460ms" }}>
                                    <blockquote>“Porque o Filho do Homem veio buscar e salvar o que se havia perdido.”</blockquote>
                                    <figcaption>Lucas 19:10</figcaption>
                                </figure>

                                <div className="jc-hero-actions hero-rise" style={{ animationDelay: "560ms" }}>
                                    <a className="btn btn-primary" href="#doutrina">Conheça a Doutrina <ArrowRight size={16} strokeWidth={2.6} /></a>
                                    <a className="btn btn-ghost" href="https://www.bibliaonline.com.br/acf/lc/19" target="_blank" rel="noopener noreferrer">
                                        <BookOpen size={16} strokeWidth={2.4} /> Leia a Palavra
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="jc-stamp" aria-hidden="true">
                            <span>LUCAS</span>
                            <strong>19:10</strong>
                        </div>

                        <div className="jc-scroll" aria-hidden="true">
                            Role
                            <ChevronDown size={18} />
                        </div>
                    </section>

                    {/* ═══════════ DOUTRINA ═══════════ */}
                    <section className="jc-section sec-doutrina" id="doutrina">
                        <div className="jc-cross jc-section-cross" aria-hidden="true" />
                        <div className="jc-inner doutrina-grid">
                            <div className="doutrina-texto">
                                <Reveal>
                                    <p className="jc-kicker">A Doutrina</p>
                                    <h2 className="jc-h2">Jesus Cristo,<br />o Salvador</h2>
                                    <p>A primeira doutrina da Igreja do Evangelho Quadrangular apresenta Jesus Cristo como o Salvador da humanidade.</p>
                                    <p>Todos pecaram e necessitam da salvação que somente Jesus pode oferecer.</p>
                                    <p>Por meio de sua morte na cruz e de sua ressurreição, Cristo abriu o caminho para que todos aqueles que creem nele recebam a vida eterna.</p>
                                </Reveal>
                                <Reveal delay={140}>
                                    <div className="verse-box">
                                        <blockquote>“Crê no Senhor Jesus Cristo e serás salvo, tu e a tua casa.”</blockquote>
                                        <cite>ATOS 16:31</cite>
                                    </div>
                                </Reveal>
                            </div>

                            <Reveal delay={160}>
                                <div className="salvador-card">
                                    <img
                                        src="/images/cruz-salvacao.jpg"
                                        alt="Cruz cristã em silhueta contra um pôr do sol de tons avermelhados"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="salvador-veil" />
                                    <div className="salvador-body">
                                        <div className="salvador-rule" />
                                        <span className="salvador-badge">I CORÍNTIOS 5:7</span>
                                        <h3>O Salvador</h3>
                                        <p>Jesus é o Cordeiro da Páscoa. Pelo seu sangue, somos protegidos da morte eterna e recebemos a salvação.</p>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </section>

                    {/* ═══════════ SIMBOLISMO ═══════════ */}
                    <section className="jc-section sec-simbolismo" id="simbolismo">
                        <div className="jc-inner">
                            <Reveal>
                                <p className="jc-kicker">Simbolismo</p>
                                <h2 className="jc-h2">O simbolismo da<br />primeira doutrina</h2>
                                <p className="sec-sub">Quatro sinais que apontam para Jesus, o Salvador.</p>
                            </Reveal>

                            <div className="sym-grid">
                                {SIMBOLOS.map((simbolo, index) => {
                                    const accent = ACCENTS[index % ACCENTS.length];
                                    return (
                                        <Reveal key={simbolo.num} delay={index * 110}>
                                            <article
                                                className="sym-card"
                                                style={{ "--accent": accent.bg, "--accent-ink": accent.ink }}
                                            >
                                                {simbolo.img ? (
                                                    <div className="sym-media" style={simbolo.pos ? { "--sym-pos": simbolo.pos } : undefined}>
                                                        <img src={simbolo.img} alt={simbolo.alt} loading="lazy" decoding="async" />
                                                    </div>
                                                ) : (
                                                    <div className="sym-drop">
                                                        <DropMark />
                                                    </div>
                                                )}
                                                <div className="sym-body">
                                                    <span className="sym-num">{simbolo.num}</span>
                                                    <div className="sym-rule" />
                                                    <h3>{simbolo.titulo}</h3>
                                                    <p>{simbolo.texto}</p>
                                                </div>
                                            </article>
                                        </Reveal>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ═══════════ FILHO DO HOMEM ═══════════ */}
                    <section className="jc-section sec-filho" id="filho-do-homem">
                        <div className="jc-cross jc-section-cross" aria-hidden="true" />
                        <div className="jc-inner filho-grid">
                            <div className="filho-texto">
                                <Reveal>
                                    <p className="jc-kicker">Evangelho de Lucas</p>
                                    <h2 className="jc-h2">Quem é o<br />Filho do Homem?</h2>
                                    <p>Jesus Cristo é o Filho de Deus que se manifestou em carne e habitou entre nós.</p>
                                    <p>O Evangelho de Lucas apresenta Jesus em sua humanidade perfeita, revelando seu amor, sua compaixão e sua missão de salvar a humanidade.</p>
                                </Reveal>

                                <Reveal delay={130}>
                                    <div className="verse-card">
                                        <span className="verse-quote" aria-hidden="true">“</span>
                                        <span className="verse-ref">JOÃO 1:1</span>
                                        <blockquote>“No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.”</blockquote>
                                    </div>
                                </Reveal>
                                <Reveal delay={220}>
                                    <div className="verse-card">
                                        <span className="verse-quote" aria-hidden="true">“</span>
                                        <span className="verse-ref">JOÃO 1:14</span>
                                        <blockquote>“E o Verbo se fez carne e habitou entre nós.”</blockquote>
                                    </div>
                                </Reveal>
                            </div>

                            <Reveal delay={180}>
                                <figure className="film-frame">
                                    <div className="film-panel-wrap">
                                        <span className="film-corner tl" /><span className="film-corner tr" />
                                        <span className="film-corner bl" /><span className="film-corner br" />
                                        <div className="film-panel">
                                            <img
                                                src="/images/jesus-salva.jpg"
                                                alt="Arte Jesus Salva — Evangelho de Lucas, Filho do Homem, com o rosto de Jesus e a cruz em fundo vermelho"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    </div>
                                    <figcaption className="film-caption">Jesus Salva · Evangelho de Lucas · Filho do Homem</figcaption>
                                </figure>
                            </Reveal>
                        </div>
                    </section>

                    {/* ═══════════ POR QUE PRECISAMOS DE UM SALVADOR ═══════════ */}
                    <section className="jc-section sec-salvacao" id="salvacao">
                        <div className="jc-inner">
                            <Reveal className="salvacao-head">
                                <p className="jc-kicker">Salvação</p>
                                <h2 className="jc-h2">Por que precisamos<br />de um Salvador?</h2>
                            </Reveal>

                            <div className="why-grid">
                                {SALVACAO_PONTOS.map((ponto, index) => {
                                    const accent = ACCENTS[index % ACCENTS.length];
                                    return (
                                        <Reveal key={ponto.n} delay={index * 110}>
                                            <div
                                                className="why-card"
                                                style={{ "--accent": accent.bg, "--accent-ink": accent.ink }}
                                            >
                                                <span className="why-num">0{ponto.n}</span>
                                                <h3>{ponto.titulo}</h3>
                                                <span className="why-ref">{ponto.ref}</span>
                                            </div>
                                        </Reveal>
                                    );
                                })}
                            </div>

                            <Reveal delay={140}>
                                <div className="salvacao-quote">
                                    <div className="rule" />
                                    <p>“A salvação é um presente de Deus, recebido pela fé em Jesus Cristo.”</p>
                                    <div className="rule" />
                                </div>
                            </Reveal>
                        </div>
                    </section>

                    {/* ═══════════ CONVITE ═══════════ */}
                    <section className="jc-section sec-convite" id="convite">
                        <div className="jc-cross jc-section-cross" aria-hidden="true" />
                        <div className="jc-inner convite-grid">
                            <div className="convite-texto">
                                <Reveal>
                                    <p className="jc-kicker">Convite</p>
                                    <h2 className="jc-h2">Jesus te ama.<br />Ele é o caminho<br />da <em>salvação!</em></h2>
                                    <p>Independentemente da sua história, Jesus oferece perdão, transformação e uma nova vida. Nele encontramos esperança e salvação.</p>
                                    <button className="btn-convite" onClick={() => navigate("/estudos/face-de-homem")}>
                                        Quero conhecer mais sobre Jesus <ArrowRight size={17} strokeWidth={2.6} />
                                    </button>
                                </Reveal>
                            </div>

                            <Reveal delay={150}>
                                <div className="convite-frame">
                                    <figure>
                                        <img
                                            src="/images/biblia.jpg"
                                            alt="Bíblia aberta sobre a mesa de madeira ao lado de uma luminária"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </figure>
                                    <div className="convite-chip">
                                        <Cross size={20} strokeWidth={2.2} />
                                        <span>
                                            <strong>A Palavra de Deus</strong>
                                            <small>Lucas 19:10</small>
                                        </span>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </section>
                </main>

                {/* ═══════════ RODAPÉ ═══════════ */}
                <footer className="jc-footer">
                    <Flag />
                    <div className="jc-footer-inner">
                        <div className="jc-footer-grid">
                            <div>
                                <div className="jc-foot-brand">
                                    <LogoIEQ size={44} />
                                    <span>
                                        <strong>IEQ Pituaçu</strong>
                                        <small>Igreja do Evangelho Quadrangular</small>
                                    </span>
                                </div>
                                <p className="jc-foot-doctr">Jesus Cristo Salva — Primeira Doutrina Quadrangular</p>
                                <blockquote className="jc-foot-verse">
                                    “Porque o Filho do Homem veio buscar e salvar o que se havia perdido.”
                                    <cite>LUCAS 19:10</cite>
                                </blockquote>
                            </div>

                            <nav aria-label="Navegação do rodapé">
                                <h3 className="jc-foot-h">Navegação</h3>
                                <ul className="jc-foot-list">
                                    {NAV_ITEMS.map(item => (
                                        <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
                                    ))}
                                </ul>
                            </nav>

                            <div>
                                <h3 className="jc-foot-h">Acesso</h3>
                                <ul className="jc-foot-list">
                                    <li><Link to="/login"><LogIn size={14} /> Entrar no Sistema</Link></li>
                                    <li><a href="mailto:washquesia@gmail.com"><Mail size={14} /> washquesia@gmail.com</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="jc-footer-bar">
                            <p>© {year} Igreja do Evangelho Quadrangular — Pituaçu. Todos os direitos reservados.</p>
                            <p>Jesus Cristo Salva — Primeira Doutrina Quadrangular · Uso exclusivo da IEQ · Suporte: <a href="mailto:washquesia@gmail.com">washquesia@gmail.com</a></p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

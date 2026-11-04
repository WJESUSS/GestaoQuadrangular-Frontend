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
            <defs>
                <radialGradient id="jc-drop-bg" cx="50%" cy="42%" r="65%">
                    <stop offset="0%" stopColor="#5A0B16" />
                    <stop offset="100%" stopColor="#26050B" />
                </radialGradient>
                <linearGradient id="jc-drop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F0344E" />
                    <stop offset="45%" stopColor="#C8102E" />
                    <stop offset="100%" stopColor="#7A0E1C" />
                </linearGradient>
                <radialGradient id="jc-drop-hi" cx="38%" cy="34%" r="42%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
                    <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="120" height="150" fill="url(#jc-drop-bg)" />
            <path d="M60 18 C60 18 26 70 26 100 a34 34 0 0 0 68 0 C94 70 60 18 60 18 Z"
                  fill="url(#jc-drop)" stroke="rgba(253,184,19,.4)" strokeWidth="1.4" />
            <path d="M60 18 C60 18 26 70 26 100 a34 34 0 0 0 68 0 C94 70 60 18 60 18 Z"
                  fill="url(#jc-drop-hi)" />
        </svg>
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
          --escarlate:#C8102E; --vermelho-profundo:#8B0000; --vinho:#350309;
          --vermelho-sec:#A50018; --dourado:#FDB813; --branco:#FFFFFF; --preto:#171717;
          --fundo:#170307; --vinho-card:#2A060D; --vinho-deep:#1D0409;
          --texto-claro:rgba(255,255,255,.78); --texto-suave:rgba(255,255,255,.55);
          --nav-h:72px;
          position:relative; min-height:100vh; overflow-x:hidden;
          font-family:'Inter',system-ui,sans-serif; color:var(--branco); background:var(--fundo);
        }
        .jc-home, .jc-home *, .jc-home *::before, .jc-home *::after { box-sizing:border-box; }
        :where(.jc-home, .jc-home *) { margin:0; padding:0; }
        .jc-home button, .jc-home a { font-family:inherit; }
        .jc-home button { cursor:pointer; }
        .jc-home :is(a,button):focus-visible { outline:2px solid var(--dourado); outline-offset:3px; border-radius:4px; }

        .jc-home section[id] { scroll-margin-top:calc(var(--nav-h) + 14px); }

        .reveal { opacity:0; transform:translateY(34px);
          transition:opacity .8s ease var(--d,0ms), transform .8s cubic-bezier(.22,1,.36,1) var(--d,0ms); }
        .reveal.is-visible { opacity:1; transform:none; }

        .hero-rise { animation:jc-rise .9s cubic-bezier(.22,1,.36,1) both; }
        @keyframes jc-rise { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:none; } }

        /* ═══════════ CABEÇALHO ═══════════ */
        .jc-nav {
          position:fixed; top:0; left:0; right:0; z-index:60; height:var(--nav-h);
          display:flex; align-items:center; justify-content:space-between; gap:20px;
          padding:0 clamp(18px,4vw,44px);
          background:linear-gradient(180deg, rgba(29,4,9,.82), rgba(53,3,9,.66));
          backdrop-filter:blur(16px) saturate(1.35); -webkit-backdrop-filter:blur(16px) saturate(1.35);
          border-bottom:1px solid rgba(253,184,19,.16);
        }
        .jc-nav::after {
          content:""; position:absolute; left:0; right:0; bottom:-1px; height:1px;
          background:linear-gradient(90deg, transparent 8%, rgba(253,184,19,.55) 38%, rgba(253,184,19,.55) 62%, transparent 92%);
          pointer-events:none;
        }
        .jc-brand { display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; flex-shrink:0; }
        .jc-brand-text { display:flex; flex-direction:column; line-height:1.15; }
        .jc-brand-text strong { font-size:15.5px; font-weight:700; letter-spacing:.02em; color:#fff; }
        .jc-brand-text small { font-size:8.5px; font-weight:500; letter-spacing:.24em; text-transform:uppercase; color:rgba(255,255,255,.58); margin-top:3px; }

        .jc-menu { display:flex; align-items:center; gap:6px; list-style:none; }
        .jc-link {
          position:relative; display:inline-flex; align-items:center; height:40px; padding:0 15px;
          font-size:12.5px; font-weight:600; letter-spacing:.05em; color:rgba(255,255,255,.82);
          text-decoration:none; border-radius:8px; transition:color .25s;
        }
        .jc-link::after {
          content:""; position:absolute; left:14px; right:14px; bottom:4px; height:2px; border-radius:2px;
          background:linear-gradient(90deg, transparent, var(--dourado), transparent);
          opacity:0; transform:scaleX(.4); transition:opacity .25s, transform .25s;
        }
        .jc-link:hover { color:#fff; }
        .jc-link:hover::after { opacity:.6; transform:scaleX(.8); }
        .jc-link.active { color:var(--dourado); }
        .jc-link.active::after { opacity:1; transform:scaleX(1); }

        .jc-entrar {
          display:inline-flex; align-items:center; gap:8px; height:40px; padding:0 22px;
          border:none; border-radius:999px; background:var(--dourado); color:#2B060D;
          font-size:12.5px; font-weight:700; letter-spacing:.06em; flex-shrink:0;
          box-shadow:0 6px 22px rgba(253,184,19,.32);
          transition:background .25s, transform .25s, box-shadow .25s;
        }
        .jc-entrar:hover { background:#FFD34D; transform:translateY(-1px); box-shadow:0 10px 30px rgba(253,184,19,.4); }

        .jc-burger { display:none; width:42px; height:42px; border:1px solid rgba(253,184,19,.35); border-radius:10px;
          background:rgba(253,184,19,.08); color:var(--dourado); align-items:center; justify-content:center; }

        .jc-mobile {
          display:none; position:fixed; top:var(--nav-h); left:0; right:0; z-index:59;
          background:rgba(23,3,7,.97); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(253,184,19,.28); padding:18px clamp(18px,4vw,32px) 26px;
          animation:jc-menu-in .28s cubic-bezier(.22,1,.36,1);
        }
        @keyframes jc-menu-in { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:none; } }
        .jc-mobile a.jc-mlink {
          display:flex; align-items:center; justify-content:space-between; padding:14px 6px;
          border-bottom:1px solid rgba(255,255,255,.07); color:rgba(255,255,255,.85);
          font-size:15px; font-weight:600; letter-spacing:.03em; text-decoration:none;
        }
        .jc-mobile a.jc-mlink.active { color:var(--dourado); }
        .jc-mobile .jc-entrar { width:100%; justify-content:center; margin-top:16px; height:48px; font-size:13px; }

        /* ═══════════ HERO ═══════════ */
        .jc-hero {
          position:relative; min-height:min(94svh, 1080px); display:flex; align-items:center; overflow:hidden;
          background:linear-gradient(118deg, #170307 0%, #350309 36%, #4A0710 62%, #1D0409 100%);
        }
        .jc-hero-media { position:absolute; top:0; right:0; bottom:0; width:min(56vw,760px); z-index:0; }
        .jc-hero-media img {
          width:100%; height:100%; object-fit:cover; object-position:50% 10%;
          -webkit-mask-image:linear-gradient(90deg, transparent 0%, rgba(0,0,0,.55) 22%, #000 46%);
          mask-image:linear-gradient(90deg, transparent 0%, rgba(0,0,0,.55) 22%, #000 46%);
        }
        .jc-veil-x { position:absolute; inset:0; z-index:1;
          background:linear-gradient(90deg, #170307 0%, rgba(23,3,7,.82) 24%, rgba(23,3,9,.35) 52%, rgba(29,4,9,.02) 74%, rgba(23,3,7,.3) 100%); }
        .jc-veil-y { position:absolute; inset:0; z-index:1;
          background:linear-gradient(180deg, rgba(23,3,7,.6) 0%, transparent 20%, transparent 62%, rgba(23,3,7,.94) 100%); }
        .jc-hero-glow { position:absolute; z-index:1; right:-10%; top:-18%; width:46vw; height:64vh;
          background:radial-gradient(closest-side, rgba(253,184,19,.16), transparent 72%); filter:blur(10px); pointer-events:none; }
        .jc-hero-glow-red { position:absolute; z-index:1; left:-14%; bottom:-24%; width:44vw; height:60vh;
          background:radial-gradient(closest-side, rgba(200,16,46,.32), transparent 72%); pointer-events:none; }

        .jc-hero-inner {
          position:relative; z-index:2; width:100%; max-width:1240px; margin:0 auto;
          padding:calc(var(--nav-h) + clamp(24px,5vh,56px)) clamp(18px,4.5vw,56px) clamp(64px,9vh,96px);
        }
        .jc-hero-content { max-width:640px; }

        .eyebrow { display:flex; align-items:center; gap:14px; }
        .eyebrow-line { width:52px; height:1px; background:linear-gradient(90deg, transparent, var(--dourado)); }
        .eyebrow-text { display:flex; align-items:center; gap:10px; font-size:.68rem; font-weight:700;
          letter-spacing:.3em; text-transform:uppercase; color:var(--dourado); }

        .jc-hero-title { margin-top:22px; font-family:'Fraunces',serif; line-height:.98; letter-spacing:-.01em; }
        .jc-hero-title .l1 { display:block; font-size:clamp(2.7rem,7.4vw,4.6rem); font-weight:600; color:#fff;
          text-shadow:0 6px 40px rgba(0,0,0,.55); }
        .jc-hero-title .l2 { display:block; font-size:clamp(3.9rem,11.5vw,7.3rem); font-weight:700;
          background:linear-gradient(168deg, #FFE9A8 0%, var(--dourado) 32%, #E09A0B 62%, #8A5A06 100%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
          filter:drop-shadow(0 10px 34px rgba(253,184,19,.28)); }

        .jc-hero-desc { margin-top:24px; font-size:clamp(1.02rem,1.35vw,1.18rem); line-height:1.75;
          color:rgba(255,255,255,.9); max-width:29rem; font-weight:400; }

        .jc-hero-verse { margin-top:26px; padding-left:16px; border-left:3px solid var(--dourado); max-width:30rem; }
        .jc-hero-verse blockquote { font-family:'Fraunces',serif; font-style:italic; font-size:clamp(.95rem,1.2vw,1.06rem);
          line-height:1.65; color:rgba(255,255,255,.86); }
        .jc-hero-verse figcaption { margin-top:8px; font-size:.68rem; font-weight:700; letter-spacing:.26em;
          color:var(--dourado); text-transform:uppercase; }

        .jc-hero-actions { display:flex; gap:14px; flex-wrap:wrap; margin-top:32px; }
        .btn {
          position:relative; overflow:hidden; display:inline-flex; align-items:center; justify-content:center;
          gap:10px; height:52px; padding:0 30px; border-radius:999px; font-size:.78rem; font-weight:700;
          letter-spacing:.13em; text-transform:uppercase; text-decoration:none; border:none;
          transition:transform .25s, box-shadow .25s, background .25s, border-color .25s, color .25s;
        }
        .btn-red { background:linear-gradient(158deg, #E0153B 0%, var(--escarlate) 45%, var(--vermelho-sec) 100%);
          color:#fff; border:1px solid rgba(255,255,255,.16); box-shadow:0 14px 40px rgba(200,16,46,.4); }
        .btn-red:hover { transform:translateY(-2px); box-shadow:0 20px 52px rgba(200,16,46,.52); }
        .btn-red::after {
          content:""; position:absolute; top:0; bottom:0; width:60%; left:-80%;
          background:linear-gradient(100deg, transparent, rgba(255,255,255,.38), transparent);
          transform:skewX(-18deg); transition:left .7s ease; pointer-events:none;
        }
        .btn-red:hover::after { left:130%; }
        .btn-gold { background:transparent; color:var(--dourado); border:1px solid rgba(253,184,19,.55); }
        .btn-gold:hover { background:rgba(253,184,19,.13); border-color:var(--dourado); transform:translateY(-2px); }

        .jc-scroll { position:absolute; z-index:2; left:0; right:0; bottom:22px; display:flex;
          flex-direction:column; align-items:center; gap:6px; color:rgba(255,255,255,.55);
          font-size:.62rem; letter-spacing:.34em; text-transform:uppercase; }
        .jc-scroll svg { animation:jc-bounce 2.2s ease-in-out infinite; color:var(--dourado); opacity:.85; }
        @keyframes jc-bounce { 0%,100% { transform:translateY(0); opacity:.55 } 50% { transform:translateY(9px); opacity:1 } }

        /* ═══════════ SEÇÕES BASE ═══════════ */
        .jc-section { position:relative; padding:clamp(72px,10vh,110px) clamp(18px,4.5vw,56px); }
        .jc-inner { max-width:1240px; margin:0 auto; position:relative; }
        .jc-kicker { display:flex; align-items:center; gap:12px; font-size:.68rem; font-weight:700;
          letter-spacing:.3em; text-transform:uppercase; }
        .jc-kicker::after { content:""; width:44px; height:1px; background:currentColor; opacity:.5; }
        .jc-h2 { font-family:'Fraunces',serif; font-weight:600; letter-spacing:-.015em;
          font-size:clamp(1.85rem,4.1vw,3rem); line-height:1.12; }

        /* ═══════════ SEÇÃO DOUTRINA (clara) ═══════════ */
        .sec-doutrina {
          background:
            radial-gradient(900px 520px at 12% -8%, rgba(200,16,46,.09), transparent 60%),
            radial-gradient(800px 500px at 105% 110%, rgba(253,184,19,.12), transparent 55%),
            #FBF4EF;
          color:var(--preto);
        }
        .sec-doutrina .jc-kicker { color:var(--escarlate); }
        .sec-doutrina .jc-h2 { color:var(--vinho); margin-top:14px; }
        .doutrina-grid { display:grid; grid-template-columns:1.02fr .98fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .doutrina-texto p { margin-top:16px; font-size:.96rem; line-height:1.85; color:#4B3532; max-width:34rem; }
        .verse-box {
          margin-top:24px; background:#fff; border:1px solid rgba(200,16,46,.14);
          border-left:4px solid var(--escarlate); border-radius:16px; padding:18px 22px;
          box-shadow:0 16px 40px rgba(53,3,9,.08); max-width:34rem;
        }
        .verse-box blockquote { font-family:'Fraunces',serif; font-style:italic; font-size:1.02rem;
          line-height:1.6; color:var(--vinho); }
        .verse-box cite { display:block; margin-top:10px; font-style:normal; font-size:.68rem; font-weight:700;
          letter-spacing:.24em; color:var(--escarlate); }

        .salvador-card {
          position:relative; min-height:520px; border-radius:26px; overflow:hidden;
          display:flex; align-items:flex-end; box-shadow:0 30px 70px rgba(53,3,9,.35);
          isolation:isolate;
        }
        .salvador-card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:50% 22%; z-index:-1; }
        .salvador-veil { position:absolute; inset:0; z-index:0;
          background:linear-gradient(178deg, rgba(53,3,9,.02) 0%, rgba(53,3,9,.34) 44%, rgba(23,3,7,.92) 100%),
                      linear-gradient(155deg, rgba(200,16,46,.34) 0%, transparent 52%); }
        .salvador-body { position:relative; z-index:1; padding:26px 28px 28px; }
        .salvador-rule { width:56px; height:2px; background:linear-gradient(90deg, var(--dourado), transparent); margin-bottom:12px; }
        .salvador-badge { display:inline-block; margin-bottom:12px; padding:6px 14px; border-radius:999px;
          border:1px solid rgba(253,184,19,.6); color:var(--dourado); font-size:.62rem; font-weight:700; letter-spacing:.26em; }
        .salvador-body h3 { font-family:'Fraunces',serif; font-weight:600; font-size:2rem; color:#fff; }
        .salvador-body p { margin-top:10px; font-size:.9rem; line-height:1.7; color:rgba(255,255,255,.88); max-width:26rem; }

        /* ═══════════ SIMBOLISMO (escarlate profundo) ═══════════ */
        .sec-simbolismo {
          background:
            radial-gradient(1100px 560px at 50% -12%, rgba(200,16,46,.42), transparent 62%),
            radial-gradient(900px 600px at 108% 112%, rgba(253,184,19,.1), transparent 55%),
            linear-gradient(180deg, #3A0510 0%, #570A12 46%, #26050B 100%);
        }
        .sec-simbolismo .jc-kicker { color:var(--dourado); }
        .sec-simbolismo .jc-h2 { color:#fff; margin-top:14px; }
        .sec-sub { margin-top:12px; color:rgba(255,255,255,.72); font-size:.95rem; line-height:1.7; max-width:34rem; }

        .sym-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:44px; }
        .sym-card {
          display:flex; flex-direction:column; height:100%; border-radius:20px; overflow:hidden;
          background:linear-gradient(168deg, #31100F 0%, var(--vinho-card) 55%, #21060C 100%);
          border:1px solid rgba(200,16,46,.42);
          box-shadow:0 14px 38px rgba(0,0,0,.35);
          transition:transform .3s, border-color .3s, box-shadow .3s;
        }
        .sym-card:hover { transform:translateY(-7px); border-color:rgba(253,184,19,.5);
          box-shadow:0 26px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(253,184,19,.18); }
        .sym-media { position:relative; height:158px; overflow:hidden; }
        .sym-media img { width:100%; height:100%; object-fit:cover; object-position:var(--sym-pos,50% 18%);
          transition:transform .6s cubic-bezier(.22,1,.36,1); }
        .sym-card:hover .sym-media img { transform:scale(1.06); }
        .sym-media::after { content:""; position:absolute; inset:0;
          background:linear-gradient(180deg, transparent 30%, rgba(42,6,13,.92) 100%); }
        .sym-drop { display:grid; place-items:center; height:158px; background:#26050B; }
        .drop-svg { width:96px; height:120px; filter:drop-shadow(0 6px 18px rgba(200,16,46,.55)); }
        .sym-body { display:flex; flex-direction:column; padding:16px 18px 20px; flex:1; }
        .sym-num { font-family:'Fraunces',serif; font-weight:700; font-size:1.35rem;
          background:linear-gradient(180deg, #FFE9A8, var(--dourado) 55%, #B97A08);
          -webkit-background-clip:text; background-clip:text; color:transparent; }
        .sym-rule { width:34px; height:2px; margin:8px 0 10px;
          background:linear-gradient(90deg, var(--dourado), transparent); opacity:.85; }
        .sym-body h3 { font-size:1.02rem; font-weight:700; color:#fff; letter-spacing:.01em; }
        .sym-body p { margin-top:8px; font-size:.83rem; line-height:1.65; color:rgba(255,255,255,.7); }

        /* ═══════════ FILHO DO HOMEM (vermelho escuro) ═══════════ */
        .sec-filho {
          background:
            radial-gradient(1000px 620px at 88% -10%, rgba(253,184,19,.12), transparent 60%),
            radial-gradient(900px 700px at -10% 110%, rgba(200,16,46,.3), transparent 55%),
            linear-gradient(180deg, #22050B 0%, var(--vinho) 52%, #1A0408 100%);
          overflow:hidden;
        }
        .sec-filho .jc-kicker { color:var(--dourado); }
        .sec-filho .jc-h2 { color:#fff; margin-top:14px; }
        .filho-grid { display:grid; grid-template-columns:1.05fr .95fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .filho-texto p { margin-top:16px; color:var(--texto-claro); font-size:.96rem; line-height:1.85; max-width:33rem; }

        .verse-card {
          position:relative; margin-top:18px; padding:20px 22px 18px 66px; border-radius:18px;
          background:rgba(53,3,9,.55); border:1px solid rgba(253,184,19,.34);
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
        }
        .verse-quote { position:absolute; top:2px; left:18px; font-family:'Fraunces',serif;
          font-size:4.2rem; line-height:1; color:rgba(253,184,19,.4); user-select:none; }
        .verse-ref { display:inline-block; font-size:.64rem; font-weight:700; letter-spacing:.28em; color:var(--dourado); }
        .verse-card blockquote { margin-top:8px; font-family:'Fraunces',serif; font-style:italic;
          font-size:.99rem; line-height:1.68; color:rgba(255,255,255,.92); }

        .film-frame { position:relative; max-width:430px; justify-self:center; width:100%; }
        .film-glow { position:absolute; inset:-14% -18%; z-index:0;
          background:radial-gradient(closest-side, rgba(200,16,46,.4), transparent 74%); filter:blur(28px); }
        .film-panel-wrap { position:relative; z-index:1; }
        .film-panel { border-radius:20px; overflow:hidden;
          border:1px solid rgba(253,184,19,.4); box-shadow:0 40px 90px rgba(0,0,0,.6); }
        .film-panel img { display:block; width:100%; height:100%; object-fit:cover; aspect-ratio:16/9.4; }
        .film-corner { position:absolute; width:26px; height:26px; z-index:2; border:0 solid var(--dourado); }
        .film-corner.tl { top:-2px; left:-2px; border-top-width:2px; border-left-width:2px; border-top-left-radius:8px; }
        .film-corner.tr { top:-2px; right:-2px; border-top-width:2px; border-right-width:2px; border-top-right-radius:8px; }
        .film-corner.bl { bottom:-2px; left:-2px; border-bottom-width:2px; border-left-width:2px; border-bottom-left-radius:8px; }
        .film-corner.br { bottom:-2px; right:-2px; border-bottom-width:2px; border-right-width:2px; border-bottom-right-radius:8px; }
        .film-caption { position:relative; z-index:1; margin-top:16px; text-align:center; font-size:.64rem;
          letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.52); }

        /* ═══════════ SALVAÇÃO (escarlate intenso) ═══════════ */
        .sec-salvacao {
          background:
            radial-gradient(1000px 600px at 50% -15%, rgba(255,255,255,.14), transparent 55%),
            radial-gradient(700px 500px at 110% 115%, rgba(23,3,7,.4), transparent 60%),
            linear-gradient(158deg, #C8102E 0%, #A50018 48%, #6E0A18 100%);
        }
        .sec-salvacao .jc-kicker { color:#FFD97A; justify-content:center; }
        .sec-salvacao .jc-kicker::before { content:""; width:44px; height:1px; background:currentColor; opacity:.5; }
        .sec-salvacao .salvacao-head { text-align:center; }
        .sec-salvacao .jc-h2 { color:#fff; margin-top:14px; text-shadow:0 4px 30px rgba(23,3,7,.35); }

        .why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:48px; }
        .why-card {
          border-radius:20px; padding:24px 20px 22px; height:100%;
          background:rgba(42,4,10,.42); border:1px solid rgba(255,255,255,.16);
          backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.12), 0 18px 44px rgba(23,3,7,.3);
          transition:transform .3s, border-color .3s;
        }
        .why-card:hover { transform:translateY(-5px); border-color:rgba(253,184,19,.55); }
        .why-num { font-family:'Fraunces',serif; font-weight:700; font-size:2.1rem; line-height:1;
          background:linear-gradient(180deg, #FFE9A8, var(--dourado) 55%, #C77F0A);
          -webkit-background-clip:text; background-clip:text; color:transparent; }
        .why-card h3 { margin-top:12px; font-size:.98rem; font-weight:700; line-height:1.45; color:#fff; min-height:2.9em; }
        .why-ref { display:inline-block; margin-top:14px; padding:6px 12px; border-radius:999px;
          border:1px solid rgba(253,184,19,.6); color:#FFD97A; font-size:.62rem; font-weight:700; letter-spacing:.18em; }

        .salvacao-quote { margin:46px auto 0; max-width:46rem; text-align:center; }
        .salvacao-quote .rule { width:88px; height:2px; margin:0 auto;
          background:linear-gradient(90deg, transparent, var(--dourado), transparent); }
        .salvacao-quote p { font-family:'Fraunces',serif; font-style:italic;
          font-size:clamp(1.1rem,2.1vw,1.45rem); line-height:1.55; color:#FFF6E6; padding:20px 12px; }

        /* ═══════════ CONVITE (branco) ═══════════ */
        .sec-convite {
          background:
            radial-gradient(820px 500px at -8% -10%, rgba(200,16,46,.08), transparent 60%),
            radial-gradient(760px 480px at 108% 112%, rgba(253,184,19,.14), transparent 55%),
            #FFFFFF;
          color:var(--preto);
        }
        .sec-convite .jc-kicker { color:var(--escarlate); }
        .convite-grid { display:grid; grid-template-columns:1.02fr .98fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .sec-convite .jc-h2 { color:var(--vinho); margin-top:14px; }
        .sec-convite .jc-h2 em { font-style:normal; color:var(--escarlate); }
        .convite-texto p { margin-top:16px; font-size:.96rem; line-height:1.85; color:#4B3532; max-width:32rem; }
        .btn-convite { margin-top:28px; height:56px; padding:0 34px; border-radius:14px;
          background:linear-gradient(158deg, #E0153B 0%, var(--escarlate) 48%, #8B0000 100%);
          color:#fff; font-size:.8rem; font-weight:700; letter-spacing:.11em; border:1px solid rgba(23,3,7,.12);
          box-shadow:0 16px 44px rgba(200,16,46,.38); display:inline-flex; align-items:center; gap:12px;
          text-transform:uppercase; transition:transform .25s, box-shadow .25s; }
        .btn-convite:hover { transform:translateY(-2px); box-shadow:0 22px 56px rgba(200,16,46,.48); }

        .convite-frame { position:relative; max-width:460px; justify-self:center; width:100%; }
        .convite-frame .glow { position:absolute; inset:-12% -14%; z-index:0;
          background:radial-gradient(closest-side, rgba(200,16,46,.22), transparent 74%); filter:blur(24px); }
        .convite-frame figure { position:relative; z-index:1; border-radius:24px; overflow:hidden;
          border:1px solid rgba(200,16,46,.3); box-shadow:0 30px 70px rgba(53,3,9,.3); }
        .convite-frame img { display:block; width:100%; aspect-ratio:4/4.6; object-fit:cover; object-position:50% 42%; }
        .convite-chip { position:absolute; z-index:2; right:-14px; bottom:26px; display:flex; align-items:center; gap:10px;
          padding:12px 18px; border-radius:16px; background:var(--vinho); border:1px solid rgba(253,184,19,.4);
          box-shadow:0 18px 44px rgba(0,0,0,.35); }
        .convite-chip svg { color:var(--dourado); flex-shrink:0; }
        .convite-chip strong { display:block; font-size:.78rem; color:#fff; letter-spacing:.04em; }
        .convite-chip small { display:block; font-size:.6rem; letter-spacing:.22em; color:var(--dourado); margin-top:2px; text-transform:uppercase; }

        /* ═══════════ RODAPÉ ═══════════ */
        .jc-footer {
          background:linear-gradient(180deg, #20060C 0%, var(--vinho-deep) 100%);
          border-top:1px solid rgba(253,184,19,.2);
        }
        .jc-footer-inner { max-width:1240px; margin:0 auto; padding:56px clamp(18px,4.5vw,56px) 0; }
        .jc-footer-grid { display:grid; grid-template-columns:1.35fr 1fr 1fr; gap:40px; }
        .jc-foot-brand { display:flex; align-items:center; gap:12px; }
        .jc-foot-brand strong { display:block; font-size:15px; color:#fff; }
        .jc-foot-brand small { display:block; font-size:8px; letter-spacing:.24em; text-transform:uppercase; color:rgba(255,255,255,.55); margin-top:3px; }
        .jc-foot-verse { margin-top:18px; padding-left:14px; border-left:2px solid rgba(253,184,19,.5);
          font-family:'Fraunces',serif; font-style:italic; font-size:.88rem; line-height:1.65; color:rgba(255,255,255,.72); }
        .jc-foot-verse cite { display:block; margin-top:8px; font-style:normal; font-family:'Inter';
          font-size:.62rem; font-weight:700; letter-spacing:.26em; color:var(--dourado); }
        .jc-foot-doctr { margin-top:14px; font-size:.78rem; color:rgba(255,255,255,.62); letter-spacing:.04em; }
        .jc-foot-h { font-size:.66rem; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:var(--dourado); }
        .jc-foot-list { list-style:none; margin-top:14px; display:flex; flex-direction:column; gap:10px; }
        .jc-foot-list a { display:inline-flex; align-items:center; gap:8px; color:rgba(255,255,255,.78);
          font-size:.85rem; text-decoration:none; transition:color .2s; }
        .jc-foot-list a:hover { color:var(--dourado); }
        .jc-footer-bar { margin-top:44px; border-top:1px solid rgba(255,255,255,.09);
          padding:20px 0 24px; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; }
        .jc-footer-bar p { font-size:.74rem; color:rgba(255,255,255,.5); }
        .jc-footer-bar a { color:var(--dourado); text-decoration:none; }
        .jc-footer-bar a:hover { text-decoration:underline; }

        /* ═══════════ RESPONSIVO ═══════════ */
        @media (max-width:1100px) {
          .sym-grid { grid-template-columns:repeat(2,1fr); }
          .why-grid { grid-template-columns:repeat(2,1fr); }
          .why-card h3 { min-height:0; }
        }
        @media (max-width:1024px) {
          .jc-menu { display:none; }
          .jc-burger { display:inline-flex; }
          .jc-mobile.open { display:block; }
          .jc-hero-media { width:52vw; }
        }
        @media (max-width:900px) {
          .doutrina-grid, .filho-grid, .convite-grid { grid-template-columns:1fr; }
          .salvador-card { min-height:420px; }
          .convite-frame { max-width:400px; }
          .film-frame { max-width:400px; }
          .jc-footer-grid { grid-template-columns:1fr; gap:28px; }
          .jc-hero-media { width:100%; opacity:.6; }
          .jc-hero-media img { object-position:50% 12%; -webkit-mask-image:none; mask-image:none; }
          .jc-veil-x { background:linear-gradient(180deg, rgba(23,3,7,.55) 0%, rgba(23,3,7,.62) 45%, rgba(23,3,7,.92) 100%); }
          .jc-veil-y { background:none; }
          .jc-hero { min-height:auto; }
          .jc-hero-inner { padding-top:calc(var(--nav-h) + 40px); padding-bottom:96px; }
        }
        @media (max-width:600px) {
          .eyebrow-text { font-size:.6rem; letter-spacing:.2em; }
          .eyebrow-line { width:26px; }
          .btn-convite { font-size:.68rem; letter-spacing:.07em; padding:0 18px; }
          .sym-grid { grid-template-columns:1fr; }
          .why-grid { grid-template-columns:1fr; }
          .jc-brand-text small { display:none; }
          .jc-entrar { height:36px; padding:0 16px; font-size:11px; }
          .jc-hero-actions { flex-direction:column; align-items:stretch; }
          .jc-hero-actions .btn { width:100%; }
          .convite-chip { right:8px; }
          .jc-footer-bar { flex-direction:column; text-align:center; justify-content:center; }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity:1 !important; transform:none !important; transition:none !important; }
          .hero-rise { animation:none !important; }
          .jc-scroll svg { animation:none; }
          .btn-red::after { display:none; }
          .jc-mobile { animation:none; }
        }
      `}</style>

            <div className="jc-home">

                {/* ═══════════ CABEÇALHO ═══════════ */}
                <header className="jc-nav">
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
                        <LogIn size={15} strokeWidth={2.4} /> Entrar
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
                        <LogIn size={16} strokeWidth={2.4} /> Entrar no Sistema
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
                        <div className="jc-veil-x" />
                        <div className="jc-veil-y" />
                        <div className="jc-hero-glow" />
                        <div className="jc-hero-glow-red" />

                        <div className="jc-hero-inner">
                            <div className="jc-hero-content">
                                <div className="eyebrow hero-rise">
                                    <span className="eyebrow-line" />
                                    <span className="eyebrow-text"><Cross size={13} strokeWidth={2.4} /> Primeira Doutrina Quadrangular</span>
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
                                    <a className="btn btn-red" href="#doutrina">Conheça a Doutrina <ArrowRight size={16} strokeWidth={2.4} /></a>
                                    <a className="btn btn-gold" href="https://www.bibliaonline.com.br/acf/lc/19" target="_blank" rel="noopener noreferrer">
                                        <BookOpen size={16} strokeWidth={2.2} /> Leia a Palavra
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="jc-scroll" aria-hidden="true">
                            Role
                            <ChevronDown size={18} />
                        </div>
                    </section>

                    {/* ═══════════ DOUTRINA ═══════════ */}
                    <section className="jc-section sec-doutrina" id="doutrina">
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
                                {SIMBOLOS.map((simbolo, index) => (
                                    <Reveal key={simbolo.num} delay={index * 110}>
                                        <article className="sym-card">
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
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ═══════════ FILHO DO HOMEM ═══════════ */}
                    <section className="jc-section sec-filho" id="filho-do-homem">
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
                                    <div className="film-glow" />
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
                                {SALVACAO_PONTOS.map((ponto, index) => (
                                    <Reveal key={ponto.n} delay={index * 110}>
                                        <div className="why-card">
                                            <span className="why-num">0{ponto.n}</span>
                                            <h3>{ponto.titulo}</h3>
                                            <span className="why-ref">{ponto.ref}</span>
                                        </div>
                                    </Reveal>
                                ))}
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
                        <div className="jc-inner convite-grid">
                            <div className="convite-texto">
                                <Reveal>
                                    <p className="jc-kicker">Convite</p>
                                    <h2 className="jc-h2">Jesus te ama.<br />Ele é o caminho<br />da <em>salvação!</em></h2>
                                    <p>Independentemente da sua história, Jesus oferece perdão, transformação e uma nova vida. Nele encontramos esperança e salvação.</p>
                                    <button className="btn-convite" onClick={() => navigate("/estudos/face-de-homem")}>
                                        Quero conhecer mais sobre Jesus <ArrowRight size={17} strokeWidth={2.4} />
                                    </button>
                                </Reveal>
                            </div>

                            <Reveal delay={150}>
                                <div className="convite-frame">
                                    <div className="glow" />
                                    <figure>
                                        <img
                                            src="/images/biblia.jpg"
                                            alt="Bíblia aberta sobre a mesa de madeira ao lado de uma luminária"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </figure>
                                    <div className="convite-chip">
                                        <Cross size={20} strokeWidth={2} />
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

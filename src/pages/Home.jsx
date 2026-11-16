import { Helmet }        from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    ArrowRight, BookOpen, ChevronDown, HeartPulse, LogIn, Mail, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
    { id: "doutrina",    label: "Doutrina" },
    { id: "simbolismo",  label: "Simbolismo" },
    { id: "ceia",        label: "Pão e Cálice" },
    { id: "condicoes",   label: "Condições" },
    { id: "convite",     label: "Convite" },
];

const SIMBOLOS = [
    {
        num: "01",
        titulo: "Rosto de Boi",
        texto: "O terceiro rosto da visão de Ezequiel simboliza Jesus como o Médico Divino. O boi é suportador de cargas; Jesus não recuou no caminho do Calvário e levou sobre si o peso dos pecados da humanidade (Is 53.4a).",
        img: "/images/boi.jpg",
        alt: "Boi ao amanhecer, símbolo de força e serviço",
        pos: "50% 42%",
    },
    {
        num: "02",
        titulo: "Evangelho de Marcos",
        texto: "Apresenta Jesus como Servo de Deus, que veio “para servir e dar a sua vida em resgate de muitos” (Mc 10.45). Ninguém foi tão obediente à vontade do Pai como Ele.",
        img: "/images/marcos.jpg",
        alt: "Evangelho de Marcos",
        pos: "50% 50%",
    },
    {
        num: "03",
        titulo: "O Cálice do Getsêmani",
        texto: "O símbolo da cura não é o cálice da Ceia, mas o do Getsêmani (Mc 14.36). Nele estavam as nossas dores, sofrimentos e doenças, que Jesus aceitou beber por nós.",
        img: "/images/calice.jpg",
        alt: "Cálice, símbolo do Getsêmani",
        pos: "50% 50%",
    },
    {
        num: "04",
        titulo: "Cor Azul",
        texto: "A terceira faixa da Bandeira Quadrangular simboliza a cura divina. O azul está no céu, de onde vêm a cura e todas as bênçãos. Representa o amor que traz esperança e lembra a misericórdia do Senhor.",
        img: "/images/azul.jpg",
        alt: "Faixa azul da bandeira Quadrangular",
        pos: "50% 50%",
    },
];

const CONDICOES = [
    {
        n: "1",
        titulo: "Pertencer a Ele.",
        texto: "É preciso ser filho de Deus, reconhecer o sacrifício de Jesus e recebê-lo. A fé no poder de Deus está aliada à fé em Jesus.",
        ref: "JOÃO 1:12",
    },
    {
        n: "2",
        titulo: "Pedir com confiança.",
        texto: "O pedido é uma demonstração de fé e de confiança em Deus e nas suas promessas.",
        ref: "MATEUS 7:7",
    },
    {
        n: "3",
        titulo: "Crer sem duvidar.",
        texto: "Nada é possível sem fé. Quem se aproxima de Deus precisa crer que Ele existe e recompensa os que o buscam.",
        ref: "HEBREUS 11:6",
    },
    {
        n: "4",
        titulo: "Receber, descansando.",
        texto: "A bênção vem sempre no momento certo. A palavra-chave é descansar: aguardar sem desespero e sem murmuração, em paz.",
        ref: "SALMO 37:7",
    },
];

const ACCENTS = [
    { bg: "#FF7A00", ink: "#061238" },
    { bg: "#FFE000", ink: "#061238" },
    { bg: "#C2187A", ink: "#FFFFFF" },
    { bg: "#4F8BFF", ink: "#061238" },
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

function CaliceMark() {
    return (
        <svg viewBox="0 0 120 150" className="drop-svg" role="img" aria-label="Cálice">
            <rect width="120" height="150" fill="#0B2160" />
            <path d="M28 22 H92 C92 62 80 80 66 86 V112 H84 V124 H36 V112 H54 V86 C40 80 28 62 28 22 Z"
                  fill="#FFE000" stroke="rgba(255,255,255,.5)" strokeWidth="1.4" />
            <path d="M32 34 H88 C87 56 78 70 60 76 C42 70 33 56 32 34 Z" fill="#4F8BFF" />
            <ellipse cx="44" cy="46" rx="4" ry="9" fill="rgba(255,255,255,.55)" transform="rotate(-12 44 46)" />
        </svg>
    );
}

function AzulMark() {
    return (
        <svg viewBox="0 0 120 150" className="drop-svg" role="img" aria-label="Faixa azul da bandeira">
            <rect width="120" height="150" fill="#0B2160" />
            <rect x="14" y="14" width="92" height="22" fill="#FF7A00" />
            <rect x="14" y="42" width="92" height="22" fill="#FFE000" />
            <rect x="14" y="70" width="92" height="22" fill="#1E4FD8" stroke="#fff" strokeWidth="3" />
            <rect x="14" y="98" width="92" height="22" fill="#C2187A" />
        </svg>
    );
}

function MarcosMark() {
    return (
        <svg viewBox="0 0 120 150" className="drop-svg" role="img" aria-label="Evangelho de Marcos">
            <rect width="120" height="150" fill="#0B2160" />
            <path d="M24 28 H78 C88 28 96 36 96 46 V122 H24 Z" fill="#F4E6B8" />
            <path d="M24 28 H78 C88 28 96 36 96 46 H24 Z" fill="#E7D28A" />
            <path d="M36 54 H84 M36 70 H84 M36 86 H72" stroke="#0B2160" strokeWidth="4" strokeLinecap="round" opacity=".85" />
            <rect x="18" y="22" width="10" height="106" rx="2" fill="#FFE000" />
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

export default function HomeTerceiraDoutrina() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen]           = useState(false);
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
                <title>O Grande Médico — Terceira Doutrina Quadrangular | IEQ Pituaçu</title>
                <meta name="description" content="Conheça a terceira doutrina da Igreja do Evangelho Quadrangular: Jesus, o Médico Divino. Pelas suas pisaduras fomos sarados. Isaías 53:5." />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="O Grande Médico — Terceira Doutrina Quadrangular" />
                <meta property="og:description" content="Jesus Cristo cura, restaura e liberta todos os que Nele creem. Isaías 53:4-5." />
                <meta property="og:image" content="/images/cura.jpg" />
                <meta property="og:type" content="website" />
            </Helmet>

            <style>{`
        .jc-home {
          --base:#1740B0; --mid:#11308A; --dark:#0B2160; --deep:#061238;
          --glow:#9CC4FF; --orange:#FF7A00; --yellow:#FFE000; --yellow-deep:#FFC400; --blue:#1E4FD8; --magenta:#C2187A;
          --sky:#4F8BFF;
          --white:#FFFFFF; --ink:#061238;
          --white-78:rgba(255,255,255,.84); --white-60:rgba(255,255,255,.66); --white-35:rgba(255,255,255,.35);
          --nav-h:74px;
          position:relative; min-height:100vh; overflow-x:hidden;
          font-family:'Inter',system-ui,sans-serif; color:var(--white); background:var(--base);
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
        .jc-hero-squares span:nth-child(3) { background:var(--sky); }
        .jc-hero-squares span:nth-child(4) { background:var(--magenta); }

        .jc-dots { display:inline-flex; gap:5px; }
        .jc-dots i { display:block; width:9px; height:9px; }
        .jc-dots i:nth-child(1) { background:var(--orange); }
        .jc-dots i:nth-child(2) { background:var(--yellow); }
        .jc-dots i:nth-child(3) { background:var(--sky); }
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
          background:var(--dark);
          border-bottom:2px solid var(--yellow);
          box-shadow:0 4px 24px rgba(79,139,255,.28);
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
          border:0; border-radius:0; background:var(--yellow); color:var(--ink);
          font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; flex-shrink:0;
          box-shadow:0 8px 20px rgba(6,18,56,.28);
          transition:transform .2s, box-shadow .2s, filter .2s;
        }
        .jc-entrar:hover { transform:translateY(-1px); box-shadow:0 12px 24px rgba(6,18,56,.34); filter:brightness(1.02); }

        .jc-burger { display:none; width:42px; height:42px; border:2px solid #fff; border-radius:0;
          background:transparent; color:#fff; align-items:center; justify-content:center; }

        .jc-mobile {
          display:none; position:fixed; top:var(--nav-h); left:0; right:0; z-index:59;
          background:var(--dark); border-bottom:4px solid var(--yellow);
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
          background:var(--base); border-bottom:6px solid var(--dark);
        }
        .jc-hero-media { position:absolute; inset:0; z-index:0; }
        .jc-hero-media img {
          width:100%; height:100%; object-fit:cover; object-position:50% 40%;
          filter:saturate(1.1) contrast(1.05) brightness(.9);
        }
        .jc-hero-media::after { content:""; position:absolute; inset:0;
          background:linear-gradient(180deg, rgba(6,18,56,.3) 0%, rgba(6,18,56,.6) 100%); }
        .jc-hero-tint { position:absolute; inset:0; z-index:1;
          background:
            radial-gradient(closest-side at 60% 38%, rgba(156,196,255,.34), rgba(79,139,255,0) 58%),
            linear-gradient(90deg, rgba(6,18,56,.88) 0%, rgba(11,33,96,.45) 42%, rgba(6,18,56,.72) 100%),
            linear-gradient(180deg, rgba(6,18,56,.18) 0%, rgba(6,18,56,.45) 100%);
          box-shadow:inset 0 0 160px 40px rgba(6,18,56,.45); }
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
          text-shadow:5px 5px 0 var(--deep); }
        .jc-hero-title .l2 { display:block; font-size:clamp(4rem,11.4vw,7.8rem); color:var(--yellow);
          text-shadow:6px 6px 0 var(--deep), 0 0 46px rgba(255,224,0,.4); }

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
          box-shadow:0 10px 28px rgba(6,18,56,.35); }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 16px 34px rgba(6,18,56,.42); filter:brightness(1.02); }
        .btn-ghost { background:rgba(255,255,255,.06); color:#fff; border-color:rgba(255,255,255,.7);
          backdrop-filter:blur(6px); }
        .btn-ghost:hover { background:#fff; color:var(--dark); transform:translateY(-2px);
          box-shadow:0 14px 30px rgba(6,18,56,.35); }

        .jc-stamp { position:absolute; z-index:2; right:clamp(24px,6vw,82px); bottom:clamp(92px,15vh,160px);
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
          padding:14px 20px; background:var(--yellow); color:var(--ink); transform:rotate(-5deg);
          box-shadow:8px 8px 0 var(--deep); }
        .jc-stamp span { font-size:.6rem; font-weight:800; letter-spacing:.26em; }
        .jc-stamp strong { font-family:'Anton',sans-serif; font-size:2.1rem; line-height:1; }

        .jc-scroll { position:absolute; z-index:2; left:0; right:0; bottom:22px; display:flex;
          flex-direction:column; align-items:center; gap:6px; color:rgba(255,255,255,.7);
          font-size:.62rem; letter-spacing:.34em; text-transform:uppercase; }
        .jc-scroll svg { animation:jc-bounce 2.2s ease-in-out infinite; color:var(--yellow); opacity:.9; }
        @keyframes jc-bounce { 0%,100% { transform:translateY(0); opacity:.6 } 50% { transform:translateY(9px); opacity:1 } }

        /* ═══════════ SEÇÕES BASE ═══════════ */
        .jc-section { position:relative; padding:clamp(76px,10vh,116px) clamp(18px,4.5vw,56px); overflow:hidden; }
        .jc-section::after { content:""; position:absolute; top:0; left:0; right:0; height:4px;
          background:linear-gradient(90deg, transparent, var(--yellow) 25%, var(--yellow) 75%, transparent);
          opacity:.55; pointer-events:none; }
        .jc-inner { max-width:1240px; margin:0 auto; position:relative; z-index:1; }
        .jc-kicker { display:flex; align-items:center; gap:10px; font-size:.7rem; font-weight:800;
          letter-spacing:.26em; text-transform:uppercase; color:var(--yellow);
          text-shadow:0 0 18px rgba(255,224,0,.45); }
        .jc-kicker::before { content:""; width:12px; height:12px; background:currentColor; flex:0 0 auto;
          box-shadow:0 0 12px rgba(255,224,0,.8); }
        .jc-kicker::after { content:""; width:40px; height:4px; background:currentColor;
          box-shadow:0 0 12px rgba(255,224,0,.6); }
        .jc-h2 { font-family:'Anton','Inter',sans-serif; font-weight:400; text-transform:uppercase;
          letter-spacing:.005em; font-size:clamp(2.1rem,4.8vw,3.7rem); line-height:.98; color:#fff;
          margin-top:14px; text-shadow:4px 4px 0 rgba(6,18,56,.4); }

        /* ═══════════ DOUTRINA ═══════════ */
        .sec-doutrina { background:radial-gradient(ellipse at 82% 4%, rgba(156,196,255,.22), transparent 55%), var(--mid); }
        .doutrina-grid { display:grid; grid-template-columns:1.02fr .98fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .doutrina-texto p { margin-top:16px; font-size:1rem; line-height:1.8; color:var(--white-78); max-width:34rem; }
        .verse-box {
          margin-top:26px; background:var(--dark); border:2px solid rgba(255,255,255,.16);
          border-left:8px solid var(--yellow); padding:20px 24px;
          box-shadow:8px 8px 0 var(--deep); max-width:34rem;
        }
        .verse-box blockquote { font-size:1.02rem; line-height:1.6; color:#fff; font-weight:600; }
        .verse-box cite { display:block; margin-top:10px; font-style:normal; font-size:.7rem; font-weight:800;
          letter-spacing:.24em; color:var(--yellow); }

        .salvador-card {
          position:relative; min-height:520px; overflow:hidden; display:flex; align-items:flex-end;
          border:1px solid rgba(255,255,255,.22); box-shadow:0 28px 60px rgba(6,18,56,.45); isolation:isolate;
        }
        .salvador-card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
          object-position:50% 30%; z-index:-1; filter:saturate(1.1) contrast(1.04) brightness(.94); }
        .salvador-card::after { content:""; position:absolute; inset:0; z-index:0;
          background:linear-gradient(180deg, rgba(6,18,56,.05) 0%, rgba(6,18,56,.45) 100%); }
        .salvador-veil { position:absolute; inset:0; z-index:0;
          background:linear-gradient(180deg, rgba(11,33,96,.1) 0%, rgba(6,18,56,.92) 100%); }
        .salvador-body { position:relative; z-index:1; padding:26px 28px 28px; }
        .salvador-rule { width:52px; height:6px; background:var(--yellow); margin-bottom:14px; }
        .salvador-badge { display:inline-block; margin-bottom:14px; padding:7px 14px; background:var(--yellow);
          color:var(--ink); font-size:.62rem; font-weight:800; letter-spacing:.2em; }
        .salvador-body h3 { font-family:'Anton',sans-serif; font-weight:400; text-transform:uppercase;
          font-size:2rem; line-height:1; color:#fff; }
        .salvador-body p { margin-top:12px; font-size:.92rem; line-height:1.7; color:var(--white-78); max-width:26rem; }

        /* ═══════════ SIMBOLISMO ═══════════ */
        .sec-simbolismo { background:radial-gradient(ellipse at 12% 2%, rgba(156,196,255,.2), transparent 52%), var(--base); }
        .sec-sub { margin-top:14px; color:var(--white-78); font-size:.98rem; line-height:1.7; max-width:34rem; }

        .sym-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:46px; }
        .sym-card {
          display:flex; flex-direction:column; height:100%; overflow:hidden;
          background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0)) , var(--mid);
          border:1px solid rgba(255,255,255,.14);
          border-top:4px solid var(--accent,var(--yellow));
          box-shadow:0 18px 40px rgba(6,18,56,.28);
          transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .sym-card:hover { transform:translateY(-4px); box-shadow:0 26px 48px rgba(6,18,56,.36); border-color:rgba(255,255,255,.22); }
        .sym-media { position:relative; height:170px; overflow:hidden; background:var(--dark); }
        .sym-media img { width:100%; height:100%; object-fit:cover; object-position:var(--sym-pos,50% 40%);
          filter:saturate(1.1) contrast(1.04) brightness(.96);
          transition:transform .6s cubic-bezier(.22,1,.36,1); }
        .sym-media::after { content:""; position:absolute; inset:0;
          background:linear-gradient(180deg, transparent 45%, rgba(6,18,56,.5) 100%); }
        .sym-card:hover .sym-media img { transform:scale(1.06); }
        .sym-drop { display:grid; place-items:center; height:170px;
          background:radial-gradient(circle at 50% 42%, rgba(156,196,255,.35), var(--dark) 66%); }
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

        /* ═══════════ CEIA (PÃO E CÁLICE) ═══════════ */
        .sec-ceia { background:radial-gradient(ellipse at 88% 6%, rgba(156,196,255,.2), transparent 54%), var(--dark); }
        .pent-grid { display:grid; grid-template-columns:1.05fr .95fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .pent-texto p { margin-top:16px; color:var(--white-78); font-size:1rem; line-height:1.8; max-width:33rem; }

        .verse-card {
          position:relative; margin-top:18px; padding:20px 22px 18px 64px;
          background:var(--mid); border:2px solid rgba(255,255,255,.16);
          border-left:8px solid var(--yellow); box-shadow:8px 8px 0 var(--deep);
        }
        .verse-card.blue { border-left-color:var(--sky); }
        .verse-quote { position:absolute; top:2px; left:18px; font-family:'Anton',sans-serif;
          font-size:3.6rem; line-height:1; color:var(--yellow); user-select:none; }
        .verse-card.blue .verse-quote, .verse-card.blue .verse-ref { color:var(--sky); }
        .verse-ref { display:inline-block; font-size:.64rem; font-weight:800; letter-spacing:.26em; color:var(--yellow); }
        .verse-card blockquote { margin-top:8px; font-size:.99rem; line-height:1.66; color:#fff; font-weight:600; }
        .verse-card p.small { margin-top:8px; font-size:.92rem; line-height:1.66; color:var(--white-78); }

        .film-frame { position:relative; max-width:430px; justify-self:center; width:100%; }
        .film-panel-wrap { position:relative; z-index:1; }
        .film-panel { overflow:hidden; border:1px solid rgba(255,255,255,.22); box-shadow:0 24px 54px rgba(6,18,56,.45); }
        .film-panel img { display:block; width:100%; height:100%; object-fit:cover; aspect-ratio:4/4.4; }
        .film-corner { position:absolute; width:26px; height:26px; z-index:2; border:0 solid var(--yellow); }
        .film-corner.tl { top:-3px; left:-3px; border-top-width:3px; border-left-width:3px; }
        .film-corner.tr { top:-3px; right:-3px; border-top-width:3px; border-right-width:3px; }
        .film-corner.bl { bottom:-3px; left:-3px; border-bottom-width:3px; border-left-width:3px; }
        .film-corner.br { bottom:-3px; right:-3px; border-bottom-width:3px; border-right-width:3px; }
        .film-caption { position:relative; z-index:1; margin-top:18px; text-align:center; font-size:.64rem;
          font-weight:700; letter-spacing:.26em; text-transform:uppercase; color:var(--white-60); }

        /* ═══════════ CONDIÇÕES ═══════════ */
        .sec-condicoes { background:radial-gradient(ellipse at 50% 0%, rgba(156,196,255,.18), transparent 55%), var(--base); }
        .sec-condicoes .imp-head { text-align:center; }
        .sec-condicoes .jc-kicker { justify-content:center; }
        .sec-condicoes .sec-sub { margin-left:auto; margin-right:auto; }

        .why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:50px; }
        .why-card {
          height:100%; padding:26px 22px 24px; background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0)), var(--mid);
          border:1px solid rgba(255,255,255,.14); border-top:4px solid var(--accent,var(--yellow));
          box-shadow:0 18px 40px rgba(6,18,56,.24);
          transition:transform .25s ease, box-shadow .25s ease;
        }
        .why-card:hover { transform:translateY(-4px); box-shadow:0 26px 46px rgba(6,18,56,.34); }
        .why-num {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:56px; height:46px; padding:0 10px; background:var(--accent,var(--yellow));
          color:var(--accent-ink,var(--ink)); font-family:'Anton',sans-serif; font-size:1.5rem; line-height:1;
        }
        .why-card h3 { margin-top:14px; font-size:.95rem; font-weight:800; line-height:1.45; color:#fff;
          text-transform:uppercase; letter-spacing:.03em; }
        .why-card p { margin-top:10px; font-size:.86rem; line-height:1.65; color:var(--white-78); }
        .why-ref { display:inline-block; margin-top:16px; padding:6px 12px;
          border:2px solid var(--yellow); color:var(--yellow);
          font-size:.62rem; font-weight:800; letter-spacing:.16em; }

        .imp-quote { margin:50px auto 0; max-width:46rem; text-align:center; }
        .imp-quote .rule { width:88px; height:6px; margin:0 auto; background:var(--yellow); }
        .imp-quote p { font-size:clamp(1.1rem,2.1vw,1.45rem); font-weight:600;
          line-height:1.55; color:#fff; padding:22px 12px; }
        .imp-quote cite { display:block; margin-top:-8px; padding-bottom:22px; font-style:normal; font-size:.7rem;
          font-weight:800; letter-spacing:.24em; color:var(--yellow); }

        /* ═══════════ CONVITE ═══════════ */
        .sec-convite { background:radial-gradient(ellipse at 16% 12%, rgba(156,196,255,.2), transparent 54%), var(--mid); }
        .sec-convite .jc-h2 em { font-style:normal; color:#fff;
          text-decoration:underline; text-decoration-color:var(--yellow);
          text-decoration-thickness:8px; text-underline-offset:6px; }
        .convite-grid { display:grid; grid-template-columns:1.02fr .98fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .convite-texto p { margin-top:16px; font-size:1rem; line-height:1.8; color:var(--white-78); max-width:32rem; }
        .btn-convite {
          margin-top:30px; height:58px; padding:0 32px; border:0; border-radius:0;
          background:var(--yellow); color:var(--ink); font-size:.78rem; font-weight:800; letter-spacing:.1em;
          box-shadow:0 14px 34px rgba(6,18,56,.35); display:inline-flex; align-items:center; gap:12px;
          text-transform:uppercase; transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;
        }
        .btn-convite:hover { transform:translateY(-2px); box-shadow:0 20px 40px rgba(6,18,56,.42); filter:brightness(1.02); }

        .convite-frame { position:relative; max-width:460px; justify-self:center; width:100%; }
        .convite-frame figure { position:relative; z-index:1; overflow:hidden;
          border:1px solid rgba(255,255,255,.22); box-shadow:0 26px 56px rgba(6,18,56,.42); }
        .convite-frame figure::after { content:""; position:absolute; inset:0;
          background:linear-gradient(180deg, transparent 55%, rgba(6,18,56,.4) 100%);
          pointer-events:none; }
        .convite-frame img { display:block; width:100%; aspect-ratio:4/4.6; object-fit:cover; object-position:50% 42%; }
        .convite-chip { position:absolute; z-index:2; right:-14px; bottom:26px; display:flex; align-items:center; gap:10px;
          padding:12px 18px; background:var(--yellow); color:var(--ink);
          box-shadow:6px 6px 0 var(--dark); }
        .convite-chip svg { color:var(--ink); flex-shrink:0; }
        .convite-chip strong { display:block; font-size:.78rem; color:var(--ink); letter-spacing:.04em; }
        .convite-chip small { display:block; font-size:.6rem; font-weight:700; letter-spacing:.2em; color:var(--dark); margin-top:2px; text-transform:uppercase; }

        /* ═══════════ RODAPÉ ═══════════ */
        .jc-footer { position:relative; background:var(--dark); }
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
          .jc-stamp { display:none; }
        }
        @media (max-width:1024px) {
          .jc-menu { display:none; }
          .jc-burger { display:inline-flex; }
          .jc-mobile.open { display:block; }
        }
        @media (max-width:900px) {
          .doutrina-grid, .pent-grid, .convite-grid { grid-template-columns:1fr; }
          .salvador-card { min-height:420px; }
          .convite-frame { max-width:400px; }
          .film-frame { max-width:400px; }
          .jc-footer-grid { grid-template-columns:1fr; gap:28px; }
          .jc-hero-cross { right:-12%; width:60vw; height:56vh; opacity:.07; }
          .jc-section-cross { display:none; }
          .jc-hero { min-height:auto; }
          .jc-hero-inner { padding-top:calc(var(--nav-h) + 44px); padding-bottom:104px; }
        }
        @media (max-width:600px) {
          .jc-hero-squares { display:none; }
          .eyebrow-text { font-size:.6rem; letter-spacing:.16em; }
          .jc-hero-title .l1 { font-size:clamp(2.4rem,11vw,3.4rem); }
          .jc-hero-title .l2 { font-size:clamp(3.2rem,15vw,4.6rem); }
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
                    <section className="jc-hero" aria-label="O Grande Médico — Terceira Doutrina Quadrangular">
                        <div className="jc-hero-media">
                            <img
                                src="/images/cura.jpg"
                                alt="Luz azul descendo do céu sobre mãos erguidas, simbolizando a cura divina"
                                fetchpriority="high"
                                decoding="async"
                                style={{ objectPosition: "50% 38%" }}
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
                                    <span className="eyebrow-text"><HeartPulse size={13} strokeWidth={2.6} /> Terceira Doutrina Quadrangular</span>
                                </div>

                                <h1 className="jc-hero-title">
                                    <span className="l1 hero-rise" style={{ animationDelay: "120ms" }}>O GRANDE</span>
                                    <span className="l2 hero-rise" style={{ animationDelay: "240ms" }}>MÉDICO!</span>
                                </h1>

                                <p className="jc-hero-desc hero-rise" style={{ animationDelay: "360ms" }}>
                                    Jesus cura, restaura e liberta todos os que Nele creem.
                                </p>

                                <figure className="jc-hero-verse hero-rise" style={{ animationDelay: "460ms" }}>
                                    <blockquote>“O castigo que nos traz a paz estava sobre ele, e pelas suas pisaduras fomos sarados.”</blockquote>
                                    <figcaption>Isaías 53:5</figcaption>
                                </figure>

                                <div className="jc-hero-actions hero-rise" style={{ animationDelay: "560ms" }}>
                                    <a className="btn btn-primary" href="#doutrina">Conheça a Doutrina <ArrowRight size={16} strokeWidth={2.6} /></a>
                                    <a className="btn btn-ghost" href="https://www.bibliaonline.com.br/acf/is/53" target="_blank" rel="noopener noreferrer">
                                        <BookOpen size={16} strokeWidth={2.4} /> Leia a Palavra
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="jc-stamp" aria-hidden="true">
                            <span>ISAÍAS</span>
                            <strong>53:4-5</strong>
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
                                    <h2 className="jc-h2">Jesus, o<br />Médico Divino</h2>
                                    <p>A terceira doutrina cardinal da Igreja do Evangelho Quadrangular mostra Jesus como o Médico Divino, Aquele que cura, o Médico dos médicos.</p>
                                    <p>Por causa do pecado de Adão, as doenças e a morte entraram na humanidade. Mas a morte de Jesus não trouxe exclusivamente a salvação: Ele veio não só para salvar, mas para restaurar a saúde de todo aquele que Nele crer.</p>
                                    <p>A cura divina é parte do sacrifício de Cristo. Deus não quis apenas salvar, mas que tivéssemos vida em abundância (Jo 10.10), e isso inclui saúde, cura e libertação.</p>
                                </Reveal>
                                <Reveal delay={140}>
                                    <div className="verse-box">
                                        <blockquote>“Verdadeiramente ele tomou sobre si as nossas enfermidades, e as nossas dores levou sobre si.”</blockquote>
                                        <cite>ISAÍAS 53:4</cite>
                                    </div>
                                </Reveal>
                            </div>

                            <Reveal delay={160}>
                                <div className="salvador-card">
                                    <img
                                        src="/images/medico-divino.jpg"
                                        alt="Mãos estendidas sob uma luz azul e dourada sobre fundo escuro"
                                        loading="lazy"
                                        decoding="async"
                                        style={{ objectPosition: "50% 32%" }}
                                    />
                                    <div className="salvador-veil" />
                                    <div className="salvador-body">
                                        <div className="salvador-rule" />
                                        <span className="salvador-badge">ISAÍAS 53:5</span>
                                        <h3>Pelas suas pisaduras</h3>
                                        <p>Aquele que foi ferido por causa das nossas transgressões também é quem nos sara e nos restaura.</p>
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
                                <h2 className="jc-h2">O simbolismo da<br />terceira doutrina</h2>
                                <p className="sec-sub">Quatro sinais que apontam para Jesus, o Médico Divino.</p>
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
                                                        {simbolo.mark === "calice" ? <CaliceMark /> : simbolo.mark === "marcos" ? <MarcosMark /> : <AzulMark />}
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

                    {/* ═══════════ CEIA: PÃO E SANGUE ═══════════ */}
                    <section className="jc-section sec-ceia" id="ceia">
                        <div className="jc-cross jc-section-cross" aria-hidden="true" />
                        <div className="jc-inner pent-grid">
                            <div className="pent-texto">
                                <Reveal>
                                    <p className="jc-kicker">A Ceia do Senhor</p>
                                    <h2 className="jc-h2">Dois elementos,<br />duas promessas</h2>
                                    <p>Na Ceia do Senhor (1 Co 11.24-34), a morte de Jesus traz dois símbolos distintos. Para o perdão, o sangue bastava; mas Deus quis também restaurar a nossa saúde.</p>
                                </Reveal>

                                <Reveal delay={130}>
                                    <div className="verse-card">
                                        <span className="verse-quote" aria-hidden="true">“</span>
                                        <span className="verse-ref">O PÃO</span>
                                        <p className="small">Simboliza o corpo de Cristo, moído, ferido e partido por nós, para nos trazer a cura das dores e enfermidades.</p>
                                    </div>
                                </Reveal>
                                <Reveal delay={220}>
                                    <div className="verse-card blue">
                                        <span className="verse-quote" aria-hidden="true">“</span>
                                        <span className="verse-ref">O SANGUE</span>
                                        <p className="small">Simboliza a nova aliança de Deus com os homens: a redenção dos nossos pecados e a salvação das nossas almas.</p>
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
                                                src="/images/calice_santa.jpg"
                                                alt="Pão e cálice sobre uma mesa, representando a Ceia do Senhor"
                                                loading="lazy"
                                                decoding="async"
                                                style={{ objectPosition: "50% 48%" }}
                                            />
                                        </div>
                                    </div>
                                    <figcaption className="film-caption">O Grande Médico · 1 Coríntios 11 · Ceia</figcaption>
                                </figure>
                            </Reveal>
                        </div>
                    </section>

                    {/* ═══════════ CONDIÇÕES ═══════════ */}
                    <section className="jc-section sec-condicoes" id="condicoes">
                        <div className="jc-inner">
                            <Reveal className="imp-head">
                                <p className="jc-kicker">Condições</p>
                                <h2 className="jc-h2">Como alcançar<br />a cura?</h2>
                                <p className="sec-sub">Quatro condições que a Palavra apresenta para receber o milagre.</p>
                            </Reveal>

                            <div className="why-grid">
                                {CONDICOES.map((item, index) => {
                                    const accent = ACCENTS[index % ACCENTS.length];
                                    return (
                                        <Reveal key={item.n} delay={index * 110}>
                                            <div
                                                className="why-card"
                                                style={{ "--accent": accent.bg, "--accent-ink": accent.ink }}
                                            >
                                                <span className="why-num">0{item.n}</span>
                                                <h3>{item.titulo}</h3>
                                                <p>{item.texto}</p>
                                                <span className="why-ref">{item.ref}</span>
                                            </div>
                                        </Reveal>
                                    );
                                })}
                            </div>

                            <Reveal delay={140}>
                                <div className="imp-quote">
                                    <div className="rule" />
                                    <p>“Os milagres não são feitos pelos homens: é de Deus que vem o poder.”</p>
                                    <cite>MARCOS 16:18</cite>
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
                                    <h2 className="jc-h2">A cura é<br />para você.<br />Receba a <em>vida!</em></h2>
                                    <p>Quando a resposta demora, isso não significa que Deus não nos ouve. Descanse, confie e aguarde em paz: a bênção vem sempre no momento certo.</p>
                                    <button className="btn-convite" onClick={() => navigate("/estudos/o-grande-medico")}>
                                        Quero estudar esta doutrina <ArrowRight size={17} strokeWidth={2.6} />
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
                                            style={{ objectPosition: "50% 45%" }}
                                        />
                                    </figure>
                                    <div className="convite-chip">
                                        <HeartPulse size={20} strokeWidth={2.2} />
                                        <span>
                                            <strong>O Grande Médico</strong>
                                            <small>Isaías 53:5</small>
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
                                <p className="jc-foot-doctr">O Grande Médico — Terceira Doutrina Quadrangular</p>
                                <blockquote className="jc-foot-verse">
                                    “O castigo que nos traz a paz estava sobre ele, e pelas suas pisaduras fomos sarados.”
                                    <cite>ISAÍAS 53:5</cite>
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
                            <p>O Grande Médico — Terceira Doutrina Quadrangular · Uso exclusivo da IEQ · Suporte: <a href="mailto:washquesia@gmail.com">washquesia@gmail.com</a></p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    ArrowRight, BookOpen, ChevronDown, Crown, LogIn, Mail, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
    { id: "doutrina", label: "Doutrina" },
    { id: "simbolismo", label: "Simbolismo" },
    { id: "profecias", label: "Profecias" },
    { id: "volta", label: "A Volta" },
    { id: "convite", label: "Convite" },
];

const SIMBOLOS = [
    {
        num: "01",
        titulo: "Rosto de Águia",
        texto: "O quarto rosto da visão de Ezequiel representa Jesus Cristo, o Rei que há de vir. Das alturas, seu olhar perscruta o universo e prepara morada para os seus.",
        img: "/images/aguia.png",
        alt: "Águia, símbolo do rosto de águia e da realeza de Cristo",
        pos: "50% 42%",
        bright: 1.35,
    },
    {
        num: "02",
        titulo: "Evangelho de Mateus",
        texto: "Mateus apresenta Jesus como o futuro Rei, herdeiro legítimo do trono de Davi: “O livro da geração de Jesus Cristo, filho de Davi” (Mt 1:1).",
        img: "/images/biblia.jpg",
        alt: "Bíblia aberta, símbolo do Evangelho de Mateus",
        pos: "50% 46%",
    },
    {
        num: "03",
        titulo: "A Coroa",
        texto: "Símbolo da Segunda Vinda. Na revelação, Jesus aparece como o Rei da Glória, com a coroa de honra e o nome: REI DOS REIS E SENHOR DOS SENHORES.",
        mark: "crown",
    },
    {
        num: "04",
        titulo: "Cor Púrpura",
        texto: "A quarta faixa da bandeira Quadrangular simboliza a realeza de Jesus Cristo, o Rei dos reis e Senhor dos senhores (Ap 19:16).",
        img: "/images/lenco.png",
        alt: "Tecido púrpura, símbolo da realeza de Cristo",
        pos: "50% 42%",
        bright: 2.4,
    },
];

const ESBOCO = [
    { letra: "A", titulo: "O Rosto de Águia", texto: "Jesus Cristo, o Rei que há de vir." },
    { letra: "B", titulo: "Evangelho de Mateus", texto: "Apresenta Jesus como o futuro Rei." },
    { letra: "C", titulo: "Jesus como Rei", texto: "Volta para buscar a sua noiva e governar as nações." },
    { letra: "D", titulo: "Símbolo: a Coroa", texto: "A coroa de honra e glória do Rei dos reis." },
    { letra: "E", titulo: "Cor Púrpura", texto: "A quarta faixa da bandeira representa a realeza de Cristo." },
];

const PROFECIAS = [
    {
        n: "01",
        titulo: "Jacó",
        ref: "GÊNESIS 49:10",
        texto: "O cetro não se arredará de Judá, nem o legislador dentre seus pés, até que venha Siló; e a ele se congregarão os povos.",
    },
    {
        n: "02",
        titulo: "Isaías",
        ref: "ISAÍAS 9:7",
        texto: "Do incremento deste principado e da paz não haverá fim, sobre o trono de Davi e no seu reino, para o firmar em juízo e justiça.",
    },
    {
        n: "03",
        titulo: "Jeremias",
        ref: "JEREMIAS 23:5-6",
        texto: "Levantarei a Davi um Renovo justo; e, sendo rei, reinará, prosperará e praticará juízo e justiça na terra.",
    },
    {
        n: "04",
        titulo: "Daniel",
        ref: "DANIEL 7:13-14",
        texto: "Vinha nas nuvens do céu um como o filho do homem; e foi-lhe dado o domínio, a honra e o reino, cujo domínio é eterno.",
    },
];

const VOLTAS = [
    {
        n: "01",
        titulo: "Com o corpo ressurreto",
        texto: "Não virá como espírito invisível, mas com o corpo que teve após a ressurreição: podia ser tocado, ver-se e comer com os discípulos.",
        ref: "ATOS 1:11 · LUCAS 24:39",
    },
    {
        n: "02",
        titulo: "Exatamente como foi",
        texto: "“Esse Jesus, que de vós foi recebido no céu, há de vir assim como para o céu o vistes ir.”",
        ref: "ATOS 1:9",
    },
    {
        n: "03",
        titulo: "Como ladrão de noite",
        texto: "Virá inesperadamente, para levar o tesouro que lhe pertence: os que lavaram seus vestidos no sangue do Cordeiro.",
        ref: "I TESS 5:2 · APOC 16:15",
    },
    {
        n: "04",
        titulo: "Com alarido e trombeta",
        texto: "O Senhor descerá do céu com alarido, voz de arcanjo e trombeta de Deus; os mortos em Cristo ressuscitarão e os vivos serão arrebatados.",
        ref: "I TESS 4:16-17",
    },
    {
        n: "05",
        titulo: "Com glória e poder",
        texto: "Não como o carpinteiro de Nazaré, mas como o Rei da Glória, com coroa de honra e o nome escrito: REI DOS REIS E SENHOR DOS SENHORES.",
        ref: "APOC 19:11-16",
    },
];

const SEQUENCIA = [
    {
        n: "1",
        titulo: "Arrebatamento",
        texto: "Os salvos, ressuscitados e transformados, são recolhidos por Ele e levados para junto do Pai.",
    },
    {
        n: "2",
        titulo: "Bodas do Cordeiro",
        texto: "Na casa do Pai, a Igreja celebra as bodas do Cordeiro em gozo e glória.",
    },
    {
        n: "3",
        titulo: "Monte das Oliveiras",
        texto: "Jesus e os remidos descem ao território de Israel; a sua presença e glória aniquilam os inimigos.",
    },
    {
        n: "4",
        titulo: "Julgamento das nações",
        texto: "Todas as nações se reúnem diante do trono: os salvos à direita e os condenados à esquerda.",
    },
    {
        n: "5",
        titulo: "Reinado milenar",
        texto: "O diabo é preso e Cristo reina com vara de ferro em justiça, verdade, amor e paz sobre toda a terra.",
    },
    {
        n: "6",
        titulo: "Eternidade",
        texto: "Após o juízo final, os remidos habitam a nova Jerusalém, seu lar definitivo e eterno.",
    },
];

const ACCENTS = [
    { bg: "#A855F7", ink: "#1E0A42" },
    { bg: "#FFE000", ink: "#1E0A42" },
    { bg: "#F3B53F", ink: "#1E0A42" },
    { bg: "#C2187A", ink: "#FFFFFF" },
];

function Reveal({ children, delay = 0, className = "" }) {
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
        <div ref={ref} className={`reveal ${className}`} style={{ "--d": `${delay}ms` }}>
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

function Flag() {
    return (
        <span className="jc-flag" aria-hidden="true">
            <i className="c-orange" /><i className="c-yellow" /><i className="c-blue" /><i className="c-purple" />
        </span>
    );
}

function CrownMark() {
    return (
        <img
            className="drop-img"
            src="/images/coroa.png"
            alt="Coroa, símbolo da Segunda Vinda"
            loading="lazy"
            decoding="async"
        />
    );
}

export default function HomeQuartaDoutrina() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
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
                <title>Jesus Voltará — Quarta Doutrina Quadrangular | IEQ Pituaçu</title>
                <meta name="description" content="Conheça a quarta doutrina da Igreja do Evangelho Quadrangular: Jesus Cristo, o Rei que há de vir, simbolizado pela face de águia e pela cor púrpura." />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="Jesus Voltará — Quarta Doutrina Quadrangular" />
                <meta property="og:description" content="O Rei dos reis e Senhor dos senhores voltará em glória para buscar os seus e reinar para sempre." />
                <meta property="og:image" content="/images/Jesus_voltara.png" />
                <meta property="og:type" content="website" />
            </Helmet>

            <style>{`
        .jc-home {
          --base:#5B21B6; --mid:#4C1D95; --dark:#32116B; --deep:#1E0A42;
          --glow:#C4B5FD; --violet:#A855F7; --purple:#7C3AED; --lilac:#D8B4FE;
          --orange:#FF7A00; --yellow:#FFE000; --yellow-deep:#F3B53F; --blue:#1E4FD8;
          --white:#FFFFFF; --ink:#1E0A42;
          --white-78:rgba(255,255,255,.84); --white-60:rgba(255,255,255,.66);
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
        .c-purple { background:var(--violet); }

        .jc-cross { position:absolute; z-index:0; pointer-events:none; opacity:.09; }
        .jc-cross::before { content:""; position:absolute; left:50%; top:0; width:30%; height:100%; background:#fff; transform:translateX(-50%); }
        .jc-cross::after { content:""; position:absolute; top:50%; left:0; width:100%; height:30%; background:#fff; transform:translateY(-50%); }
        .jc-section-cross { right:2%; top:50%; width:180px; height:280px; transform:translateY(-50%); }

        .jc-hero-squares { position:absolute; z-index:2; top:calc(var(--nav-h) + 30px); right:clamp(18px,5vw,64px); display:grid; grid-template-columns:repeat(2,20px); gap:6px; }
        .jc-hero-squares span { display:block; width:20px; height:20px; }
        .jc-hero-squares span:nth-child(1) { background:var(--orange); }
        .jc-hero-squares span:nth-child(2) { background:var(--yellow); }
        .jc-hero-squares span:nth-child(3) { background:var(--blue); }
        .jc-hero-squares span:nth-child(4) { background:var(--violet); }

        .jc-dots { display:inline-flex; gap:5px; }
        .jc-dots i { display:block; width:9px; height:9px; }
        .jc-dots i:nth-child(1) { background:var(--orange); }
        .jc-dots i:nth-child(2) { background:var(--yellow); }
        .jc-dots i:nth-child(3) { background:var(--blue); }
        .jc-dots i:nth-child(4) { background:var(--violet); }

        .reveal { opacity:0; transform:translateY(34px);
          transition:opacity .8s ease var(--d,0ms), transform .8s cubic-bezier(.22,1,.36,1) var(--d,0ms); }
        .reveal.is-visible { opacity:1; transform:none; }
        .hero-rise { animation:jc-rise .9s cubic-bezier(.22,1,.36,1) both; }
        @keyframes jc-rise { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:none; } }
        @keyframes jc-bounce { 0%,100% { transform:translateY(0); opacity:.6 } 50% { transform:translateY(9px); opacity:1 } }
        @keyframes jc-menu-in { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:none; } }

        .jc-nav {
          position:fixed; top:0; left:0; right:0; z-index:60; height:var(--nav-h);
          display:flex; align-items:center; justify-content:space-between; gap:20px;
          padding:6px clamp(18px,4vw,44px) 0; background:var(--dark);
          border-bottom:2px solid var(--yellow);
          box-shadow:0 4px 24px rgba(30,10,66,.35);
        }
        .jc-nav .jc-flag { position:absolute; top:0; left:0; right:0; height:6px; }
        .jc-brand { display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; flex-shrink:0; }
        .jc-brand img { border:2px solid #fff; }
        .jc-brand-text { display:flex; flex-direction:column; line-height:1.1; }
        .jc-brand-text strong { font-size:15px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; color:#fff; }
        .jc-brand-text small { font-size:8.5px; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:var(--white-60); margin-top:4px; }
        .jc-menu { display:flex; align-items:center; gap:2px; list-style:none; }
        .jc-link {
          position:relative; display:inline-flex; align-items:center; height:40px; padding:0 12px;
          font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--white-78);
          text-decoration:none; transition:color .2s, background .2s;
        }
        .jc-link::after {
          content:""; position:absolute; left:12px; right:12px; bottom:4px; height:4px;
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
          box-shadow:0 8px 20px rgba(30,10,66,.35);
          transition:transform .2s, box-shadow .2s, filter .2s;
        }
        .jc-entrar:hover { transform:translateY(-1px); box-shadow:0 12px 24px rgba(30,10,66,.45); filter:brightness(1.02); }
        .jc-burger { display:none; width:42px; height:42px; border:2px solid #fff; border-radius:0;
          background:transparent; color:#fff; align-items:center; justify-content:center; }
        .jc-mobile {
          display:none; position:fixed; top:var(--nav-h); left:0; right:0; z-index:59;
          background:var(--dark); border-bottom:4px solid var(--yellow);
          padding:18px clamp(18px,4vw,32px) 26px; animation:jc-menu-in .28s cubic-bezier(.22,1,.36,1);
        }
        .jc-mobile a.jc-mlink {
          display:flex; align-items:center; justify-content:space-between; padding:15px 4px;
          border-bottom:1px solid rgba(255,255,255,.14); color:var(--white-78);
          font-size:14px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; text-decoration:none;
        }
        .jc-mobile a.jc-mlink.active { color:var(--yellow); }
        .jc-mobile .jc-entrar { width:100%; justify-content:center; margin-top:18px; height:50px; font-size:12px; }

        .jc-hero {
          position:relative; min-height:min(96svh, 1060px); display:flex; align-items:center; overflow:hidden;
          background:var(--base); border-bottom:6px solid var(--dark);
        }
        .jc-hero-media { position:absolute; inset:0; z-index:0; }
        .jc-hero-media img {
          width:100%; height:100%; object-fit:cover; object-position:50% 36%;
          filter:saturate(1.08) contrast(1.05) brightness(.9);
        }
        .jc-hero::before {
          content:""; position:absolute; inset:0; z-index:0;
          background:
            radial-gradient(circle at 78% 22%, rgba(255,224,0,.18), transparent 26%),
            radial-gradient(ellipse at 72% 74%, rgba(168,85,247,.42), transparent 58%);
        }
        .jc-hero::after {
          content:""; position:absolute; inset:0; z-index:0; opacity:.18;
          background-image:radial-gradient(circle, rgba(255,255,255,.9) 1px, transparent 2px);
          background-size:130px 110px; background-position:24px 30px;
        }
        .jc-hero-tint { position:absolute; inset:0; z-index:1;
          background:
            linear-gradient(90deg, rgba(30,10,66,.93) 0%, rgba(76,29,149,.58) 46%, rgba(30,10,66,.58) 100%),
            linear-gradient(180deg, rgba(30,10,66,.18) 0%, rgba(30,10,66,.62) 100%);
          box-shadow:inset 0 0 170px 44px rgba(30,10,66,.42); }
        .jc-hero-cross { top:50%; right:5%; width:min(38vw,420px); height:min(54vh,560px); transform:translateY(-50%); }
        .jc-hero-inner {
          position:relative; z-index:2; width:100%; max-width:1240px; margin:0 auto;
          padding:calc(var(--nav-h) + clamp(24px,5vh,56px)) clamp(18px,4.5vw,56px) clamp(72px,10vh,110px);
        }
        .jc-hero-content { max-width:640px; }
        .eyebrow { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .eyebrow-text { display:flex; align-items:center; gap:9px; font-size:.7rem; font-weight:800;
          letter-spacing:.26em; text-transform:uppercase; color:#fff; }
        .jc-hero-title { margin-top:24px; font-family:'Anton','Inter',sans-serif; font-weight:400;
          text-transform:uppercase; line-height:.9; letter-spacing:.005em; }
        .jc-hero-title .l1 { display:block; font-size:clamp(3rem,8.2vw,6.2rem); color:#fff;
          text-shadow:5px 5px 0 var(--deep); }
        .jc-hero-title .l2 { display:block; font-size:clamp(3.8rem,11vw,7.4rem); color:var(--yellow);
          text-shadow:6px 6px 0 var(--deep), 0 0 46px rgba(255,224,0,.38); }
        .jc-hero-desc { margin-top:26px; font-size:clamp(1.04rem,1.4vw,1.2rem); line-height:1.7;
          color:#fff; max-width:31rem; font-weight:500; }
        .jc-hero-verse { margin-top:26px; padding-left:18px; border-left:6px solid var(--yellow); max-width:33rem; }
        .jc-hero-verse blockquote { font-family:'EB Garamond',Georgia,serif; font-size:clamp(1.1rem,1.45vw,1.28rem);
          line-height:1.55; color:#fff; font-weight:500; }
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
          box-shadow:0 10px 28px rgba(30,10,66,.4); }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 16px 34px rgba(30,10,66,.5); filter:brightness(1.02); }
        .btn-ghost { background:rgba(255,255,255,.06); color:#fff; border-color:rgba(255,255,255,.7);
          backdrop-filter:blur(6px); }
        .btn-ghost:hover { background:#fff; color:var(--dark); transform:translateY(-2px);
          box-shadow:0 14px 30px rgba(30,10,66,.4); }
        .jc-stamp { position:absolute; z-index:2; right:clamp(24px,6vw,82px); bottom:clamp(92px,15vh,160px);
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
          padding:14px 20px; background:var(--yellow); color:var(--ink); transform:rotate(-5deg);
          box-shadow:8px 8px 0 var(--deep); }
        .jc-stamp span { font-size:.6rem; font-weight:800; letter-spacing:.26em; }
        .jc-stamp strong { font-family:'Cinzel',serif; font-size:1.5rem; line-height:1; letter-spacing:.08em; }
        .jc-scroll { position:absolute; z-index:2; left:0; right:0; bottom:22px; display:flex;
          flex-direction:column; align-items:center; gap:6px; color:rgba(255,255,255,.7);
          font-size:.62rem; letter-spacing:.34em; text-transform:uppercase; }
        .jc-scroll svg { animation:jc-bounce 2.2s ease-in-out infinite; color:var(--yellow); opacity:.9; }

        .jc-section { position:relative; padding:clamp(76px,10vh,116px) clamp(18px,4.5vw,56px); overflow:hidden; }
        .jc-section::after { content:""; position:absolute; top:0; left:0; right:0; height:4px;
          background:linear-gradient(90deg, transparent, var(--yellow) 25%, var(--yellow) 75%, transparent);
          opacity:.55; pointer-events:none; }
        .jc-inner { max-width:1240px; margin:0 auto; position:relative; z-index:1; }
        .jc-kicker { display:flex; align-items:center; gap:10px; font-size:.7rem; font-weight:800;
          letter-spacing:.26em; text-transform:uppercase; color:var(--yellow); }
        .jc-kicker::before { content:""; width:12px; height:12px; background:currentColor; flex:0 0 auto;
          box-shadow:0 0 12px rgba(255,224,0,.55); }
        .jc-kicker::after { content:""; width:40px; height:4px; background:currentColor; }
        .jc-h2 { font-family:'Anton','Inter',sans-serif; font-weight:400; text-transform:uppercase;
          letter-spacing:.005em; font-size:clamp(2.1rem,4.8vw,3.7rem); line-height:.98; color:#fff;
          margin-top:14px; text-shadow:4px 4px 0 rgba(30,10,66,.4); }
        .sec-sub { margin-top:14px; color:var(--white-78); font-size:.98rem; line-height:1.7; max-width:35rem; }

        .sec-doutrina { background:radial-gradient(ellipse at 82% 4%, rgba(168,85,247,.26), transparent 55%), var(--mid); }
        .doutrina-grid { display:grid; grid-template-columns:1.02fr .98fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .doutrina-texto p { margin-top:16px; font-size:1rem; line-height:1.8; color:var(--white-78); max-width:34rem; }
        .verse-box {
          margin-top:26px; background:var(--dark); border:2px solid rgba(255,255,255,.16);
          border-left:8px solid var(--yellow); padding:20px 24px;
          box-shadow:8px 8px 0 var(--deep); max-width:34rem;
        }
        .verse-box blockquote { font-family:'Cinzel',serif; font-size:1rem; line-height:1.5; color:#fff; font-weight:600; }
        .verse-box cite { display:block; margin-top:10px; font-style:normal; font-size:.7rem; font-weight:800;
          letter-spacing:.24em; color:var(--yellow); }
        .salvador-card {
          position:relative; min-height:520px; overflow:hidden; display:flex; align-items:flex-end;
          border:1px solid rgba(255,255,255,.22); box-shadow:0 28px 60px rgba(30,10,66,.5); isolation:isolate;
          background:radial-gradient(circle at 50% 26%, rgba(255,224,0,.2), transparent 42%),
            radial-gradient(ellipse at 50% 60%, rgba(168,85,247,.55), transparent 60%), var(--dark);
        }
        .salvador-card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
          object-position:50% 40%; filter:saturate(1.1) contrast(1.08) brightness(1.4); }
        .salvador-card::after { content:""; position:absolute; inset:0; z-index:0;
          background:linear-gradient(180deg, rgba(30,10,66,0) 0%, rgba(30,10,66,.18) 40%, rgba(30,10,66,.94) 100%); }
        .salvador-body { position:relative; z-index:1; padding:26px 28px 28px; }
        .salvador-rule { width:52px; height:6px; background:var(--yellow); margin-bottom:14px; }
        .salvador-badge { display:inline-block; margin-bottom:14px; padding:7px 14px; background:var(--yellow);
          color:var(--ink); font-size:.62rem; font-weight:800; letter-spacing:.2em; }
        .salvador-body h3 { font-family:'Anton',sans-serif; font-weight:400; text-transform:uppercase;
          font-size:2rem; line-height:1; color:#fff; }
        .salvador-body p { margin-top:12px; font-size:.92rem; line-height:1.7; color:var(--white-78); max-width:26rem; }

        .sec-simbolismo { background:radial-gradient(ellipse at 12% 2%, rgba(196,181,253,.2), transparent 52%), var(--base); }
        .sym-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:46px; }
        .sym-card {
          display:flex; flex-direction:column; height:100%; overflow:hidden;
          background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,0)), var(--mid);
          border:1px solid rgba(255,255,255,.14); border-top:4px solid var(--accent,var(--yellow));
          box-shadow:0 18px 40px rgba(30,10,66,.32);
          transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .sym-card:hover { transform:translateY(-4px); box-shadow:0 26px 48px rgba(30,10,66,.42);
          border-color:rgba(255,255,255,.24); }
        .sym-media { position:relative; height:170px; overflow:hidden; background:var(--dark); }
        .sym-media img { width:100%; height:100%; object-fit:cover; object-position:var(--sym-pos,50% 40%);
          filter:saturate(1.1) contrast(1.04) brightness(var(--sym-bright,.94));
          transition:transform .6s cubic-bezier(.22,1,.36,1); }
        .sym-media::after { content:""; position:absolute; inset:0;
          background:linear-gradient(180deg, transparent 45%, rgba(30,10,66,.55) 100%); }
        .sym-card:hover .sym-media img { transform:scale(1.06); }
        .sym-drop { display:grid; place-items:center; height:170px;
          background:radial-gradient(circle at 50% 42%, rgba(196,181,253,.3), var(--dark) 68%); }
        .drop-svg { width:96px; height:120px; }
        .drop-img { display:block; width:100%; height:100%; object-fit:contain; }
        .sym-body { display:flex; flex-direction:column; padding:18px 18px 22px; flex:1; }
        .sym-num { display:inline-flex; align-items:center; justify-content:center; align-self:flex-start;
          min-width:48px; height:38px; padding:0 10px; background:var(--accent,var(--yellow));
          color:var(--accent-ink,var(--ink)); font-family:'Anton',sans-serif; font-size:1.2rem; line-height:1; }
        .sym-rule { width:34px; height:4px; margin:12px 0 10px; background:var(--accent,var(--yellow)); }
        .sym-body h3 { font-size:1rem; font-weight:800; color:#fff; letter-spacing:.04em; text-transform:uppercase; }
        .sym-body p { margin-top:8px; font-size:.85rem; line-height:1.65; color:var(--white-78); }
        .jc-outline { margin-top:52px; border-top:1px solid rgba(255,255,255,.16); padding-top:32px; }
        .jc-outline h3 { font-family:'Cinzel',serif; font-size:1.05rem; letter-spacing:.16em; color:var(--yellow); text-transform:uppercase; }
        .outline-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-top:22px; }
        .outline-item { padding:18px 16px; background:rgba(255,255,255,.05); border-left:3px solid var(--violet); }
        .outline-item strong { font-family:'Cinzel',serif; font-size:.9rem; color:var(--yellow); letter-spacing:.12em; }
        .outline-item h4 { margin-top:6px; font-size:.86rem; font-weight:800; text-transform:uppercase; color:#fff; }
        .outline-item p { margin-top:6px; font-size:.78rem; line-height:1.6; color:var(--white-78); }

        .sec-profecias { background:radial-gradient(ellipse at 88% 6%, rgba(168,85,247,.24), transparent 54%), var(--dark); }
        .why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:46px; }
        .why-card {
          height:100%; padding:26px 22px 24px;
          background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0)), var(--mid);
          border:1px solid rgba(255,255,255,.14); border-top:4px solid var(--accent,var(--yellow));
          box-shadow:0 18px 40px rgba(30,10,66,.28);
          transition:transform .25s ease, box-shadow .25s ease;
        }
        .why-card:hover { transform:translateY(-4px); box-shadow:0 26px 46px rgba(30,10,66,.4); }
        .why-num { display:inline-flex; align-items:center; justify-content:center;
          min-width:56px; height:46px; padding:0 10px; background:var(--accent,var(--yellow));
          color:var(--accent-ink,var(--ink)); font-family:'Anton',sans-serif; font-size:1.5rem; line-height:1; }
        .why-card h3 { margin-top:14px; font-size:.95rem; font-weight:800; line-height:1.45; color:#fff;
          text-transform:uppercase; letter-spacing:.03em; }
        .why-card p { margin-top:10px; font-family:'EB Garamond',Georgia,serif; font-size:1rem; line-height:1.55; color:var(--white-78); }
        .why-ref { display:inline-block; margin-top:16px; padding:6px 12px;
          border:2px solid var(--yellow); color:var(--yellow);
          font-size:.62rem; font-weight:800; letter-spacing:.16em; }
        .jc-fact { margin-top:44px; display:flex; align-items:center; gap:20px; flex-wrap:wrap;
          padding:22px 26px; background:var(--mid); border-left:8px solid var(--yellow); box-shadow:8px 8px 0 var(--deep); }
        .jc-fact strong { font-family:'Anton',sans-serif; font-size:2.4rem; color:var(--yellow); line-height:1; }
        .jc-fact span { font-size:.95rem; line-height:1.6; color:var(--white-78); max-width:36rem; }

        .sec-volta { background:radial-gradient(ellipse at 50% 0%, rgba(196,181,253,.2), transparent 55%), var(--base); }
        .sec-volta .imp-head { text-align:center; }
        .sec-volta .jc-kicker { justify-content:center; }
        .sec-volta .sec-sub { margin-left:auto; margin-right:auto; }
        .volta-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(214px,1fr)); gap:20px; margin-top:50px; }
        .verse-card {
          position:relative; margin-top:34px; padding:20px 22px 18px 64px;
          background:var(--mid); border:2px solid rgba(255,255,255,.16);
          border-left:8px solid var(--yellow); box-shadow:8px 8px 0 var(--deep);
        }
        .verse-quote { position:absolute; top:2px; left:18px; font-family:'Anton',sans-serif;
          font-size:3.6rem; line-height:1; color:var(--yellow); user-select:none; }
        .verse-ref { display:inline-block; font-size:.64rem; font-weight:800; letter-spacing:.26em; color:var(--yellow); }
        .verse-card blockquote { margin-top:8px; font-family:'EB Garamond',Georgia,serif;
          font-size:1.14rem; line-height:1.6; color:#fff; }
        .jc-timeline { margin-top:64px; position:relative; padding-left:clamp(22px,4vw,52px); }
        .jc-timeline::before { content:""; position:absolute; left:clamp(7px,1.7vw,21px); top:6px; bottom:10px;
          width:3px; background:linear-gradient(180deg, var(--yellow), var(--violet) 55%, rgba(168,85,247,.25)); }
        .timeline-head { display:flex; align-items:center; gap:14px; margin-bottom:28px; }
        .timeline-head h3 { font-family:'Cinzel',serif; font-size:1.15rem; letter-spacing:.16em; text-transform:uppercase; color:#fff; }
        .timeline-head span { width:52px; height:3px; background:var(--yellow); }
        .timeline-item { position:relative; padding:0 0 30px 10px; }
        .timeline-item::before { content:""; position:absolute; left:calc(clamp(7px,1.7vw,21px) - clamp(22px,4vw,52px) - 7px);
          top:8px; width:17px; height:17px; background:var(--yellow); border:4px solid var(--base);
          box-shadow:0 0 0 2px var(--yellow); }
        .timeline-item h4 { font-size:.98rem; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#fff; }
        .timeline-item h4 b { font-family:'Cinzel',serif; color:var(--yellow); margin-right:10px; }
        .timeline-item p { margin-top:7px; font-size:.9rem; line-height:1.7; color:var(--white-78); max-width:44rem; }

        .sec-convite { background:radial-gradient(ellipse at 16% 12%, rgba(168,85,247,.26), transparent 54%), var(--mid); }
        .sec-convite .jc-h2 em { font-style:normal; color:#fff;
          text-decoration:underline; text-decoration-color:var(--yellow);
          text-decoration-thickness:8px; text-underline-offset:6px; }
        .convite-grid { display:grid; grid-template-columns:1.02fr .98fr; gap:clamp(32px,4.5vw,72px); align-items:center; }
        .convite-texto p { margin-top:16px; font-size:1rem; line-height:1.8; color:var(--white-78); max-width:32rem; }
        .btn-convite {
          margin-top:30px; height:58px; padding:0 32px; border:0; border-radius:0;
          background:var(--yellow); color:var(--ink); font-size:.78rem; font-weight:800; letter-spacing:.1em;
          box-shadow:0 14px 34px rgba(30,10,66,.4); display:inline-flex; align-items:center; gap:12px;
          text-transform:uppercase; text-decoration:none;
          transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;
        }
        .btn-convite:hover { transform:translateY(-2px); box-shadow:0 20px 40px rgba(30,10,66,.5); filter:brightness(1.02); }
        .convite-frame { position:relative; max-width:460px; justify-self:center; width:100%; }
        .convite-frame figure { position:relative; z-index:1; overflow:hidden;
          border:1px solid rgba(255,255,255,.22); box-shadow:0 26px 56px rgba(30,10,66,.46); }
        .convite-frame figure::after { content:""; position:absolute; inset:0;
          background:linear-gradient(180deg, rgba(76,29,149,.12) 20%, rgba(30,10,66,.55) 100%);
          pointer-events:none; }
        .convite-frame img { display:block; width:100%; aspect-ratio:4/4.6; object-fit:cover; object-position:50% 45%; }
        .convite-chip { position:absolute; z-index:2; right:-14px; bottom:26px; display:flex; align-items:center; gap:10px;
          padding:12px 18px; background:var(--yellow); color:var(--ink); box-shadow:6px 6px 0 var(--dark); }
        .convite-chip svg { color:var(--ink); flex-shrink:0; }
        .convite-chip strong { display:block; font-size:.78rem; color:var(--ink); letter-spacing:.04em; }
        .convite-chip small { display:block; font-size:.6rem; font-weight:700; letter-spacing:.2em; color:var(--dark); margin-top:2px; text-transform:uppercase; }

        .jc-footer { position:relative; background:var(--dark); }
        .jc-footer .jc-flag { height:8px; }
        .jc-footer-inner { max-width:1240px; margin:0 auto; padding:56px clamp(18px,4.5vw,56px) 0; }
        .jc-footer-grid { display:grid; grid-template-columns:1.35fr 1fr 1fr; gap:40px; }
        .jc-foot-brand { display:flex; align-items:center; gap:12px; }
        .jc-foot-brand img { border:2px solid #fff; }
        .jc-foot-brand strong { display:block; font-size:15px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; color:#fff; }
        .jc-foot-brand small { display:block; font-size:8px; letter-spacing:.22em; text-transform:uppercase; color:var(--white-60); margin-top:4px; }
        .jc-foot-verse { margin-top:18px; padding-left:16px; border-left:4px solid var(--yellow);
          font-family:'EB Garamond',Georgia,serif; font-size:1rem; line-height:1.55; color:var(--white-78); }
        .jc-foot-verse cite { display:block; margin-top:8px; font-style:normal; font-family:'Inter',sans-serif;
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

        @media (max-width:1100px) {
          .sym-grid { grid-template-columns:repeat(2,1fr); }
          .why-grid { grid-template-columns:repeat(2,1fr); }
          .outline-grid { grid-template-columns:repeat(3,1fr); }
          .jc-stamp { display:none; }
        }
        @media (max-width:1024px) {
          .jc-menu { display:none; }
          .jc-burger { display:inline-flex; }
          .jc-mobile.open { display:block; }
        }
        @media (max-width:900px) {
          .doutrina-grid, .convite-grid { grid-template-columns:1fr; }
          .salvador-card { min-height:420px; }
          .convite-frame { max-width:400px; }
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
          .sym-grid, .why-grid, .outline-grid { grid-template-columns:1fr; }
          .jc-brand-text small { display:none; }
          .jc-entrar { height:38px; padding:0 14px; font-size:10.5px; }
          .jc-hero-actions { flex-direction:column; align-items:stretch; }
          .jc-hero-actions .btn { width:100%; }
          .convite-chip { right:8px; }
          .jc-footer-bar { flex-direction:column; text-align:center; justify-content:center; }
          .jc-stamp { display:none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity:1 !important; transform:none !important; transition:none !important; }
          .hero-rise { animation:none !important; }
          .jc-scroll svg { animation:none; }
          .jc-mobile { animation:none; }
        }
      `}</style>

            <div className="jc-home">

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
                    <section className="jc-hero" aria-label="Jesus Voltará — Quarta Doutrina Quadrangular">
                        <div className="jc-hero-media">
                            <img
                                src="/images/Jesus_voltara.png"
                                alt="Imagem da quarta doutrina: Jesus, o Rei que há de vir"
                                fetchpriority="high"
                                decoding="async"
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
                                    <span className="eyebrow-text"><Crown size={13} strokeWidth={2.6} /> Quarta Doutrina Quadrangular</span>
                                </div>

                                <h1 className="jc-hero-title">
                                    <span className="l1 hero-rise" style={{ animationDelay: "120ms" }}>JESUS</span>
                                    <span className="l2 hero-rise" style={{ animationDelay: "240ms" }}>VOLTARÁ!</span>
                                </h1>

                                <p className="jc-hero-desc hero-rise" style={{ animationDelay: "360ms" }}>
                                    O Rei dos reis e Senhor dos senhores volta em glória para buscar os seus e reinar para sempre.
                                </p>

                                <figure className="jc-hero-verse hero-rise" style={{ animationDelay: "460ms" }}>
                                    <blockquote>“Certamente, cedo venho! Amém. Ora vem, Senhor Jesus.”</blockquote>
                                    <figcaption>Apocalipse 22:20</figcaption>
                                </figure>

                                <div className="jc-hero-actions hero-rise" style={{ animationDelay: "560ms" }}>
                                    <a className="btn btn-primary" href="#doutrina">Conheça a Doutrina <ArrowRight size={16} strokeWidth={2.6} /></a>
                                    <a className="btn btn-ghost" href="#profecias"><BookOpen size={16} strokeWidth={2.4} /> Ver as Profecias</a>
                                </div>
                            </div>
                        </div>

                        <div className="jc-stamp" aria-hidden="true">
                            <span>APOCALIPSE 22:20</span>
                            <strong>CEDO VENHO</strong>
                        </div>

                        <div className="jc-scroll" aria-hidden="true">
                            Role
                            <ChevronDown size={18} />
                        </div>
                    </section>

                    <section className="jc-section sec-doutrina" id="doutrina">
                        <div className="jc-cross jc-section-cross" aria-hidden="true" />
                        <div className="jc-inner doutrina-grid">
                            <div className="doutrina-texto">
                                <Reveal>
                                    <p className="jc-kicker">A Doutrina</p>
                                    <h2 className="jc-h2">Jesus, o Rei<br />que há de vir</h2>
                                    <p>A quarta doutrina cardinal da Igreja do Evangelho Quadrangular apresenta Jesus Cristo na face de águia: o Rei dos reis e Senhor dos senhores, que tem o céu por habitação e volta em glória para o seu povo.</p>
                                    <p>Como a águia, que habita os mais altos penhascos e alça voo soberana em todas as direções, Cristo contempla os filhos dos homens e todo o universo está a seus pés. Ele desceu das regiões celestes para encarnar, voltou à glória e tornará a descer até as nuvens.</p>
                                    <p>Sua vinda traz a primeira ressurreição, o arrebatamento dos salvos e as bodas do Cordeiro. Depois, com os remidos, desce sobre o Monte das Oliveiras, julga as nações e estabelece o seu reino de justiça, amor, verdade e paz.</p>
                                </Reveal>
                                <Reveal delay={140}>
                                    <div className="verse-box">
                                        <blockquote>“REI DOS REIS E SENHOR DOS SENHORES”</blockquote>
                                        <cite>APOCALIPSE 19:16</cite>
                                    </div>
                                </Reveal>
                            </div>

                            <Reveal delay={160}>
                                <div className="salvador-card">
                                    <img
                                        src="/images/aguia.png"
                                        alt="Águia, símbolo do Rei que há de vir"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="salvador-body">
                                        <div className="salvador-rule" />
                                        <span className="salvador-badge">EZEQUIEL 1:10</span>
                                        <h3>A face de águia</h3>
                                        <p>Do alto dos céus, o Rei preparou para nós uma morada, comprada ao custo da sua própria vida.</p>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </section>

                    <section className="jc-section sec-simbolismo" id="simbolismo">
                        <div className="jc-inner">
                            <Reveal>
                                <p className="jc-kicker">Simbolismo</p>
                                <h2 className="jc-h2">Os símbolos da<br />quarta doutrina</h2>
                                <p className="sec-sub">Quatro sinais que anunciam a volta do Rei e a sua realeza.</p>
                            </Reveal>

                            <div className="sym-grid">
                                {SIMBOLOS.map((simbolo, index) => {
                                    const accent = ACCENTS[index % ACCENTS.length];
                                    return (
                                        <Reveal key={simbolo.num} delay={index * 110}>
                                            <article className="sym-card" style={{ "--accent": accent.bg, "--accent-ink": accent.ink }}>
                                                {simbolo.img ? (
                                                    <div className="sym-media" style={{
                                                        "--sym-pos": simbolo.pos || "50% 40%",
                                                        "--sym-bright": simbolo.bright || 0.94,
                                                    }}>
                                                        <img src={simbolo.img} alt={simbolo.alt} loading="lazy" decoding="async" />
                                                    </div>
                                                ) : (
                                                    <div className="sym-drop">
                                                        {simbolo.mark === "crown" ? <CrownMark /> : null}
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

                            <Reveal>
                                <div className="jc-outline" id="esboco">
                                    <h3>Esboço do estudo</h3>
                                    <div className="outline-grid">
                                        {ESBOCO.map(item => (
                                            <div className="outline-item" key={item.letra}>
                                                <strong>{item.letra}</strong>
                                                <h4>{item.titulo}</h4>
                                                <p>{item.texto}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </section>

                    <section className="jc-section sec-profecias" id="profecias">
                        <div className="jc-inner">
                            <Reveal>
                                <p className="jc-kicker">Profecias</p>
                                <h2 className="jc-h2">O Rei prometido<br />desde a antiguidade</h2>
                                <p className="sec-sub">As Escrituras anunciam o advento do Rei cujo reino nunca terá fim.</p>
                            </Reveal>

                            <div className="why-grid">
                                {PROFECIAS.map((item, index) => {
                                    const accent = ACCENTS[index % ACCENTS.length];
                                    return (
                                        <Reveal key={item.n} delay={index * 110}>
                                            <div className="why-card" style={{ "--accent": accent.bg, "--accent-ink": accent.ink }}>
                                                <span className="why-num">{item.n}</span>
                                                <h3>{item.titulo}</h3>
                                                <p>“{item.texto}”</p>
                                                <span className="why-ref">{item.ref}</span>
                                            </div>
                                        </Reveal>
                                    );
                                })}
                            </div>

                            <Reveal delay={140}>
                                <div className="jc-fact">
                                    <strong>318</strong>
                                    <span>referências à Segunda Vinda distribuídas pelos 260 capítulos do Novo Testamento — da promessa de Jesus aos discípulos até “Certamente cedo Venho” (Ap 22:20).</span>
                                </div>
                            </Reveal>
                        </div>
                    </section>

                    <section className="jc-section sec-volta" id="volta">
                        <div className="jc-inner">
                            <Reveal className="imp-head">
                                <p className="jc-kicker">A Volta</p>
                                <h2 className="jc-h2">De que maneira<br />Jesus voltará?</h2>
                                <p className="sec-sub">O mesmo Jesus, com o mesmo corpo, virá de modo inesperado para os seus e em glória para o mundo.</p>
                            </Reveal>

                            <div className="volta-grid">
                                {VOLTAS.map((item, index) => {
                                    const accent = ACCENTS[index % ACCENTS.length];
                                    return (
                                        <Reveal key={item.n} delay={index * 90}>
                                            <div className="why-card" style={{ "--accent": accent.bg, "--accent-ink": accent.ink }}>
                                                <span className="why-num">{item.n}</span>
                                                <h3>{item.titulo}</h3>
                                                <p>{item.texto}</p>
                                                <span className="why-ref">{item.ref}</span>
                                            </div>
                                        </Reveal>
                                    );
                                })}
                            </div>

                            <Reveal delay={120}>
                                <div className="verse-card">
                                    <span className="verse-quote" aria-hidden="true">“</span>
                                    <span className="verse-ref">O ARREBATAMENTO</span>
                                    <blockquote>O mesmo Senhor descerá do céu com alarido, com voz de arcanjo e com a trombeta de Deus; e os que morreram em Cristo ressuscitarão primeiro. Depois nós, os que ficarmos vivos, seremos arrebatados juntamente com eles nas nuvens, a encontrar o Senhor nos ares; e assim estaremos sempre com o Senhor.</blockquote>
                                    <span className="why-ref">I TESSALONICENSES 4:16-17</span>
                                </div>
                            </Reveal>

                            <div className="jc-timeline">
                                <Reveal>
                                    <div className="timeline-head">
                                        <span aria-hidden="true" />
                                        <h3>A sequência do retorno</h3>
                                    </div>
                                </Reveal>
                                {SEQUENCIA.map((item, index) => (
                                    <Reveal key={item.n} delay={index * 70}>
                                        <div className="timeline-item" role="listitem">
                                            <h4><b>{item.n}</b> {item.titulo}</h4>
                                            <p>{item.texto}</p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="jc-section sec-convite" id="convite">
                        <div className="jc-cross jc-section-cross" aria-hidden="true" />
                        <div className="jc-inner convite-grid">
                            <div className="convite-texto">
                                <Reveal>
                                    <p className="jc-kicker">Convite</p>
                                    <h2 className="jc-h2">Ora vem,<br /><em>Senhor Jesus!</em></h2>
                                    <p>A promessa é certa: Ele volta para levar os que Nele puseram sua fé, vigiaram e esperaram pela sua vinda. Que possamos estar prontos para encontrar o Rei nos ares e viver para sempre com Ele.</p>
                                    <a className="btn-convite" href="#esboco">Ver o esboço do estudo <ArrowRight size={17} strokeWidth={2.6} /></a>
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
                                        <Crown size={20} strokeWidth={2.2} />
                                        <span>
                                            <strong>Jesus Voltará</strong>
                                            <small>Apocalipse 22:20</small>
                                        </span>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </section>
                </main>

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
                                <p className="jc-foot-doctr">Jesus Voltará — Quarta Doutrina Quadrangular</p>
                                <blockquote className="jc-foot-verse">
                                    “Certamente, cedo venho! Amém. Ora vem, Senhor Jesus.”
                                    <cite>APOCALIPSE 22:20</cite>
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
                            <p>Jesus Voltará — Quarta Doutrina Quadrangular · Uso exclusivo da IEQ · Suporte: <a href="mailto:washquesia@gmail.com">washquesia@gmail.com</a></p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

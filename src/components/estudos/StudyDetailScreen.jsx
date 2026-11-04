import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowUp, Cross, ChevronRight, Quote } from "lucide-react";
import AccordionSection from "./AccordionSection.jsx";
import VerseQuote from "./VerseQuote.jsx";
import NumberedList from "./NumberedList.jsx";
import RichText from "./RichText.jsx";

function Blocos({ blocos }) {
    return (
        <>
            {blocos.map((b, i) => {
                if (b.tipo === "versiculo") {
                    return <VerseQuote key={i} refLabel={b.ref} texto={b.texto} lead={b.lead} />;
                }
                if (b.tipo === "lista") {
                    return (
                        <ul className="sd-list" key={i}>
                            {b.itens.map((item, j) => (
                                <li key={j}><RichText text={item} /></li>
                            ))}
                        </ul>
                    );
                }
                return <p className="sd-p" key={i}><RichText text={b.texto} /></p>;
            })}
        </>
    );
}

function SimboloCard({ simbolo }) {
    if (simbolo.tipo === "cruz") {
        return (
            <article id={simbolo.id} className="sd-symbol sd-symbol-cruz" aria-label="Símbolo da Salvação: a Cruz">
                <div className="sd-symbol-icon" aria-hidden="true">
                    <Cross size={92} strokeWidth={1.1} />
                </div>
                <h3 className="sd-symbol-title">{simbolo.titulo}</h3>
                <p className="sd-symbol-sub">{simbolo.subtitulo}</p>
                <p className="sd-symbol-text">
                    {simbolo.texto} <strong className="sd-ref">({simbolo.ref})</strong>.
                </p>
            </article>
        );
    }
    return (
        <article id={simbolo.id} className="sd-symbol sd-symbol-escarlate" aria-label="Cor simbólica: Escarlate">
            <div className="sd-escarlate-band" aria-hidden="true">
                <span>ESCARLATE</span>
                <code>#C8102E</code>
            </div>
            <h3 className="sd-symbol-title">{simbolo.titulo}</h3>
            <p className="sd-symbol-sub">{simbolo.subtitulo}</p>
            <p className="sd-symbol-text">
                {simbolo.texto} <strong className="sd-symbol-strong">“{simbolo.destaque}”</strong>.
            </p>
        </article>
    );
}

export default function StudyDetailScreen({ study }) {
    const navigate = useNavigate();
    const [aberto, setAberto] = useState({
        introducao: true,
        esboco: true,
        comentario: false,
        "verbo-encarnado": false,
        "aspectos-humanos": false,
        simbolos: false,
    });
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 280);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const toggle = (secao) => setAberto((prev) => ({ ...prev, [secao]: !prev[secao] }));

    const irPara = (alvoId) => {
        const precisaAbrir = alvoId.startsWith("comentario") && !aberto.comentario;
        if (precisaAbrir) {
            setAberto((prev) => ({ ...prev, comentario: true }));
        }
        window.setTimeout(() => {
            const el = document.getElementById(alvoId);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, precisaAbrir ? 380 : 0);
    };

    const voltarAoTopo = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <div className="sd-root">
            <Helmet>
                <title>{study.tituloDestaque} — {study.subtitulo} | IEQ Gestão</title>
                <meta name="description" content={`Estudo doutrinário completo: ${study.titulo} — ${study.subtitulo}. Versículo-chave: ${study.versiculoChave.ref}.`} />
            </Helmet>

            <style>{`
                .sd-root, .sd-root *, .sd-root *::before, .sd-root *::after { box-sizing: border-box; }
                .sd-root {
                    --sd-bg: #F4F6F9;
                    --sd-panel: #FFFFFF;
                    --sd-ink: #12233B;
                    --sd-text: #3C4A5E;
                    --sd-sub: #5B6B80;
                    --sd-accent: #C8102E;
                    --sd-accent-deep: #8E0B20;
                    --sd-accent-text: #C8102E;
                    --sd-accent-soft: rgba(200,16,46,.07);
                    --sd-accent-border: rgba(200,16,46,.35);
                    --sd-border: rgba(15,42,74,.14);
                    --sd-shadow: 0 12px 34px rgba(10,29,51,.10);
                    --sd-focus: #C8102E;

                    min-height: 100dvh;
                    background: var(--sd-bg);
                    color: var(--sd-text);
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 17px;
                    line-height: 1.65;
                    -webkit-font-smoothing: antialiased;
                    overflow-x: hidden;
                    position: relative;
                }
                html.dark .sd-root, .dark .sd-root {
                    --sd-bg: #070D1C;
                    --sd-panel: #0F1B2D;
                    --sd-ink: #F1F5F9;
                    --sd-text: #C3CDD9;
                    --sd-sub: #93A5BB;
                    --sd-accent: #C8102E;
                    --sd-accent-deep: #A50E27;
                    --sd-accent-text: #F8717F;
                    --sd-accent-soft: rgba(200,16,46,.22);
                    --sd-accent-border: rgba(248,113,127,.45);
                    --sd-border: rgba(255,255,255,.14);
                    --sd-shadow: 0 18px 44px rgba(0,0,0,.45);
                    --sd-focus: #F8717F;
                }
                .sd-root :is(button, a, [tabindex]):focus-visible {
                    outline: 3px solid var(--sd-focus);
                    outline-offset: 3px;
                    border-radius: 6px;
                }

                .sd-topbar {
                    position: sticky; top: 0; z-index: 40;
                    height: 60px; display: flex; align-items: center; justify-content: space-between;
                    padding: 0 clamp(16px, 4vw, 40px);
                    background: var(--sd-panel);
                    border-bottom: 1px solid var(--sd-border);
                    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
                }
                .sd-back {
                    display: inline-flex; align-items: center; gap: 8px;
                    height: 40px; padding: 0 16px 0 10px; border-radius: 999px;
                    border: 1px solid var(--sd-border); background: transparent;
                    color: var(--sd-ink); font-family: inherit; font-size: 14px; font-weight: 600;
                    cursor: pointer; transition: background .2s, border-color .2s, color .2s;
                }
                .sd-back:hover { background: var(--sd-accent-soft); border-color: var(--sd-accent-border); color: var(--sd-accent-text); }
                .sd-topbar-title {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 12px; letter-spacing: .18em; font-weight: 800; color: var(--sd-sub);
                }
                .sd-topbar-title svg { color: var(--sd-accent-text); }
                @media (max-width: 480px) { .sd-topbar-title { display: none; } }

                .sd-hero {
                    position: relative; max-width: 880px; margin: 0 auto;
                    padding: clamp(36px, 7vw, 72px) clamp(18px, 5vw, 40px) clamp(28px, 5vw, 44px);
                    border-bottom: 1px solid var(--sd-border);
                    overflow: hidden;
                }
                .sd-hero-glow {
                    position: absolute; inset: 0; pointer-events: none;
                    background: radial-gradient(560px 320px at 85% 8%, var(--sd-accent-soft), transparent 70%);
                }
                .sd-hero-cross {
                    position: absolute; right: -24px; top: 6px;
                    color: var(--sd-accent); opacity: .14; pointer-events: none;
                }
                .sd-kicker {
                    position: relative; display: flex; align-items: center; gap: 10px;
                    font-size: 11px; letter-spacing: .26em; font-weight: 700;
                    text-transform: uppercase; color: var(--sd-accent-text); margin: 0 0 18px;
                }
                .sd-kicker::before { content: ""; width: 34px; height: 2px; background: var(--sd-accent); border-radius: 2px; }
                .sd-title {
                    position: relative; margin: 0;
                    font-family: 'Fraunces', Georgia, serif; font-weight: 700;
                    font-size: clamp(2.6rem, 9vw, 4.2rem); line-height: 1.02;
                    letter-spacing: -.015em; color: var(--sd-ink);
                }
                .sd-subtitle {
                    position: relative; margin: 14px 0 0;
                    font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 500;
                    font-size: clamp(1.15rem, 3.4vw, 1.5rem); color: var(--sd-sub);
                }
                .sd-hero-verse {
                    position: relative; margin-top: 26px; display: flex; gap: 14px; align-items: flex-start;
                    max-width: 620px; padding: 16px 20px; border-left: 4px solid var(--sd-accent);
                    background: var(--sd-panel); border-radius: 0 16px 16px 0;
                    box-shadow: var(--sd-shadow); border-top: 1px solid var(--sd-border);
                    border-right: 1px solid var(--sd-border); border-bottom: 1px solid var(--sd-border);
                }
                .sd-hero-verse svg { flex-shrink: 0; color: var(--sd-accent-text); margin-top: 2px; }
                .sd-hero-verse p { margin: 0; font-size: 15.5px; font-style: italic; color: var(--sd-text); }
                .sd-hero-verse cite {
                    display: block; margin-top: 8px; font-style: normal;
                    font-size: 12px; font-weight: 800; letter-spacing: .12em;
                    text-transform: uppercase; color: var(--sd-accent-text);
                }

                .sd-body { max-width: 880px; margin: 0 auto; padding: clamp(22px, 4vw, 40px) clamp(18px, 5vw, 40px) 120px; display: flex; flex-direction: column; gap: 16px; }

                .sd-acc {
                    background: var(--sd-panel); border: 1px solid var(--sd-border);
                    border-radius: 20px; overflow: hidden; box-shadow: var(--sd-shadow);
                    scroll-margin-top: 78px;
                }
                .sd-acc-heading { margin: 0; font-size: inherit; }
                .sd-acc-btn {
                    width: 100%; display: flex; align-items: center; gap: 16px;
                    padding: 18px 20px; background: transparent; border: none;
                    color: var(--sd-ink); cursor: pointer; text-align: left;
                    font-family: inherit; transition: background .2s;
                }
                .sd-acc-btn:hover { background: var(--sd-accent-soft); }
                .sd-acc-num {
                    flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px;
                    display: grid; place-items: center;
                    background: var(--sd-accent-soft); border: 1px solid var(--sd-accent-border);
                    color: var(--sd-accent-text); font-size: 15px; font-weight: 800; letter-spacing: .05em;
                }
                .sd-acc-title { flex: 1; font-size: clamp(15px, 3.6vw, 17.5px); font-weight: 700; line-height: 1.35; }
                .sd-acc-chevron { flex-shrink: 0; color: var(--sd-sub); transition: transform .3s; }
                .sd-acc-open .sd-acc-chevron { transform: rotate(180deg); color: var(--sd-accent-text); }

                .sd-acc-panel {
                    display: grid; grid-template-rows: 0fr; visibility: hidden;
                    transition: grid-template-rows .35s ease, visibility .35s;
                }
                .sd-acc-open .sd-acc-panel { grid-template-rows: 1fr; visibility: visible; }
                .sd-acc-inner { overflow: hidden; min-height: 0; visibility: hidden; transition: visibility .35s; }
                .sd-acc-open .sd-acc-inner { visibility: visible; }
                .sd-acc-inner > * { margin: 0 20px 20px; }

                .sd-p { margin: 0 0 14px; font-size: 16.5px; line-height: 1.72; color: var(--sd-text); }
                .sd-ref { color: var(--sd-accent-text); font-weight: 700; white-space: nowrap; }
                .sd-list { margin: 0 0 14px 4px; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; }
                .sd-list li {
                    position: relative; padding-left: 26px; font-size: 16.5px; line-height: 1.65;
                }
                .sd-list li::before {
                    content: ""; position: absolute; left: 2px; top: .42em;
                    width: 8px; height: 8px; border-radius: 50%; background: var(--sd-accent);
                }

                .sd-verse { margin: 0 0 16px; }
                .sd-verse-lead { margin: 0 0 10px; font-size: 16.5px; color: var(--sd-text); }
                .sd-verse-quote {
                    position: relative; margin: 0; padding: 18px 20px 18px 54px;
                    border-left: 4px solid var(--sd-accent); border-radius: 0 14px 14px 0;
                    background: var(--sd-accent-soft);
                }
                .sd-verse-icon { position: absolute; left: 18px; top: 18px; color: var(--sd-accent-text); opacity: .8; }
                .sd-verse-quote p { margin: 0; font-family: 'Fraunces', Georgia, serif; font-size: 17.5px; line-height: 1.6; color: var(--sd-ink); }
                .sd-verse-ref { margin: 10px 4px 0 0; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--sd-accent-text); text-align: right; }

                .sd-outline { display: flex; flex-direction: column; gap: 10px; }
                .sd-outline-item {
                    display: flex; align-items: center; gap: 14px; width: 100%;
                    padding: 12px 14px; border-radius: 14px; border: 1px solid var(--sd-border);
                    background: transparent; color: var(--sd-ink); cursor: pointer;
                    font-family: inherit; font-size: 15.5px; text-align: left;
                    transition: background .2s, border-color .2s, transform .2s;
                }
                .sd-outline-item:hover { background: var(--sd-accent-soft); border-color: var(--sd-accent-border); transform: translateX(4px); }
                .sd-outline-letter {
                    flex-shrink: 0; width: 38px; height: 38px; border-radius: 10px;
                    display: grid; place-items: center;
                    background: var(--sd-accent); color: #fff;
                    font-family: 'Fraunces', Georgia, serif; font-weight: 700; font-size: 17px;
                }
                .sd-outline-arrow { margin-left: auto; flex-shrink: 0; color: var(--sd-sub); transition: color .2s; }
                .sd-outline-item:hover .sd-outline-arrow { color: var(--sd-accent-text); }

                .sd-com-item { scroll-margin-top: 78px; padding: 4px 0 2px; }
                .sd-com-item + .sd-com-item { border-top: 1px dashed var(--sd-border); margin-top: 20px; padding-top: 20px; }
                .sd-com-head { display: flex; align-items: center; gap: 12px; margin: 0 0 12px; }
                .sd-com-letter {
                    flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px;
                    display: grid; place-items: center; background: var(--sd-accent-soft);
                    border: 1px solid var(--sd-accent-border);
                    color: var(--sd-accent-text); font-weight: 800; font-size: 14px;
                }
                .sd-com-head h3 { margin: 0; font-size: 17px; font-weight: 800; color: var(--sd-ink); line-height: 1.35; }

                .sd-num-list { list-style: none; margin: 0 0 14px; padding: 0; display: flex; flex-direction: column; gap: 12px; }
                .sd-num-item {
                    display: flex; align-items: flex-start; gap: 16px;
                    padding: 14px 16px; border-radius: 14px;
                    border: 1px solid var(--sd-border); background: var(--sd-panel);
                    border-left: 4px solid var(--sd-accent);
                }
                .sd-num {
                    flex-shrink: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 700;
                    font-size: 26px; line-height: 1.15; color: var(--sd-accent-text);
                    border-right: 1px solid var(--sd-border); padding-right: 16px;
                }
                .sd-num-text { margin: 0; font-size: 16px; line-height: 1.65; }

                .sd-fecho {
                    margin: 4px 0 0; padding: 16px 18px; border-radius: 14px;
                    background: var(--sd-accent-soft); border: 1px solid var(--sd-accent-border);
                    font-size: 16px; line-height: 1.65; color: var(--sd-text);
                }

                .sd-symbols { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
                .sd-symbol {
                    border-radius: 18px; border: 1px solid var(--sd-border);
                    background: var(--sd-panel); padding: 22px 20px; text-align: center;
                    display: flex; flex-direction: column; align-items: center;
                }
                .sd-symbol-icon {
                    width: 130px; height: 130px; border-radius: 50%;
                    display: grid; place-items: center; margin-bottom: 16px;
                    color: var(--sd-accent-text);
                    background: radial-gradient(circle, var(--sd-accent-soft) 0%, transparent 70%);
                    border: 1px solid var(--sd-accent-border);
                }
                .sd-symbol-title { margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 700; font-size: 24px; letter-spacing: .28em; padding-left: .28em; color: var(--sd-ink); }
                .sd-symbol-sub { margin: 6px 0 14px; font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--sd-sub); }
                .sd-symbol-text { margin: 0; font-size: 15px; line-height: 1.65; color: var(--sd-text); }
                .sd-symbol-strong { color: var(--sd-accent-text); }
                .sd-escarlate-band {
                    width: 100%; height: 96px; border-radius: 12px; margin-bottom: 16px;
                    background: linear-gradient(135deg, #E8384F 0%, #C8102E 45%, #8E0B20 100%);
                    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,.35);
                }
                .sd-escarlate-band span { color: #fff; font-weight: 800; letter-spacing: .42em; padding-left: .42em; font-size: 21px; text-shadow: 0 1px 4px rgba(0,0,0,.35); }
                .sd-escarlate-band code { color: rgba(255,255,255,.82); font-size: 11px; letter-spacing: .18em; background: rgba(0,0,0,.22); padding: 3px 12px; border-radius: 999px; }

                .sd-foot {
                    max-width: 880px; margin: 0 auto; padding: 22px clamp(18px,5vw,40px) 44px;
                    border-top: 1px solid var(--sd-border);
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--sd-sub);
                    text-align: center;
                }
                .sd-foot svg { color: var(--sd-accent-text); flex-shrink: 0; }

                .sd-top-btn {
                    position: fixed; right: 18px; bottom: 22px; z-index: 40;
                    width: 52px; height: 52px; border-radius: 50%; border: none;
                    background: var(--sd-accent); color: #fff; cursor: pointer;
                    display: grid; place-items: center;
                    box-shadow: 0 10px 26px rgba(200,16,46,.45);
                    opacity: 0; transform: translateY(12px); pointer-events: none;
                    transition: opacity .25s, transform .25s, background .2s;
                }
                .sd-top-btn.sd-show { opacity: 1; transform: translateY(0); pointer-events: auto; }
                .sd-top-btn:hover { background: var(--sd-accent-deep); }

                @media (max-width: 560px) {
                    .sd-root { font-size: 16px; }
                    .sd-p, .sd-list li, .sd-num-text { font-size: 15.5px; }
                    .sd-acc-inner > * { margin: 0 14px 16px; }
                    .sd-acc-btn { padding: 15px 14px; gap: 10px; }
                    .sd-acc-num { width: 38px; height: 38px; font-size: 13px; }
                    .sd-num { font-size: 22px; padding-right: 12px; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .sd-root *, .sd-root *::before, .sd-root *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
                }
            `}</style>

            <header className="sd-topbar">
                <button type="button" className="sd-back" onClick={() => navigate("/")}>
                    <ArrowLeft size={18} aria-hidden="true" /> Voltar
                </button>
                <span className="sd-topbar-title">
                    <Cross size={15} aria-hidden="true" /> FACE DE HOMEM
                </span>
                <span style={{ width: 40 }} aria-hidden="true" />
            </header>

            <section className="sd-hero">
                <div className="sd-hero-glow" aria-hidden="true" />
                <Cross className="sd-hero-cross" size={230} strokeWidth={0.55} aria-hidden="true" />
                <p className="sd-kicker">Estudo Doutrinário · Evangelho Quadrangular</p>
                <h1 className="sd-title">{study.tituloDestaque}</h1>
                <p className="sd-subtitle">{study.subtitulo}</p>
                <div className="sd-hero-verse">
                    <Quote size={22} aria-hidden="true" />
                    <div>
                        <p>“{study.versiculoChave.texto}”</p>
                        <cite>{study.versiculoChave.ref}</cite>
                    </div>
                </div>
            </section>

            <main className="sd-body">
                <AccordionSection id="sec-introducao" numero={1} titulo="Introdução" aberto={aberto.introducao} onToggle={() => toggle("introducao")}>
                    <Blocos blocos={study.introducao} />
                </AccordionSection>

                <AccordionSection id="sec-esboco" numero={2} titulo="Esboço do estudo" aberto={aberto.esboco} onToggle={() => toggle("esboco")}>
                    <nav className="sd-outline" aria-label="Sumário do estudo">
                        {study.esboco.map((item) => (
                            <button key={item.letra} type="button" className="sd-outline-item" onClick={() => irPara(item.alvo)}>
                                <span className="sd-outline-letter" aria-hidden="true">{item.letra}</span>
                                <span>{item.titulo}</span>
                                <ChevronRight size={18} className="sd-outline-arrow" aria-hidden="true" />
                            </button>
                        ))}
                    </nav>
                </AccordionSection>

                <AccordionSection id="sec-comentario" numero={3} titulo="Comentário" aberto={aberto.comentario} onToggle={() => toggle("comentario")}>
                    {study.comentario.map((item) => (
                        <div key={item.id} id={item.id} className="sd-com-item">
                            <div className="sd-com-head">
                                <span className="sd-com-letter" aria-hidden="true">{item.letra}</span>
                                <h3>{item.titulo}</h3>
                            </div>
                            <Blocos blocos={item.blocos} />
                        </div>
                    ))}
                </AccordionSection>

                <AccordionSection id="sec-verbo-encarnado" numero={4} titulo={study.porQueVerboSeFezCarneTitulo} aberto={aberto["verbo-encarnado"]} onToggle={() => toggle("verbo-encarnado")}>
                    <NumberedList items={study.porQueVerboSeFezCarne} />
                </AccordionSection>

                <AccordionSection id="sec-aspectos-humanos" numero={5} titulo={study.aspectosHumanosTitulo} aberto={aberto["aspectos-humanos"]} onToggle={() => toggle("aspectos-humanos")}>
                    <NumberedList items={study.aspectosHumanos} />
                    <p className="sd-fecho"><RichText text={study.aspectosFecho} /></p>
                </AccordionSection>

                <AccordionSection id="sec-simbolos" numero={6} titulo="Símbolos" aberto={aberto.simbolos} onToggle={() => toggle("simbolos")}>
                    <div className="sd-symbols">
                        {study.simbolos.map((s) => <SimboloCard key={s.id} simbolo={s} />)}
                    </div>
                </AccordionSection>
            </main>

            <footer className="sd-foot">
                <Cross size={14} aria-hidden="true" /> Igreja do Evangelho Quadrangular · Estudos Doutrinários
            </footer>

            <button
                type="button"
                className={`sd-top-btn${showTop ? " sd-show" : ""}`}
                onClick={voltarAoTopo}
                aria-label="Voltar ao topo"
                title="Voltar ao topo"
            >
                <ArrowUp size={22} aria-hidden="true" />
            </button>
        </div>
    );
}

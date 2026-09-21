/* ─── Fundo "Glass" em camadas ────────────────────────────────────────────
   Reproduz o backdrop da nova tela de Login: fundo escuro com glows violeta/
   magenta/azul e a arte de linhas (blue → violeta → magenta) nos cantos.   */
import React from "react";

const BLUE   = [64, 72, 255];
const VIOLET = [150, 44, 255];
const MAG    = [255, 44, 176];

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
        <svg className="fg-art" viewBox="0 0 480 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
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
                            opacity={s < 0.5 ? 0.5 + s : 1 - (s - 0.5)}
                        />
                    );
                })
            )}
        </svg>
    );
}

export default function FundoGlass() {
    return (
        <>
            <style>{`
        .fg-backdrop { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .fg-art { position: absolute; }
        .fg-art-tr { top: 0; right: 0; width: min(31vw, 430px);
          -webkit-mask-image: linear-gradient(to bottom,#000 62%,transparent);
          mask-image: linear-gradient(to bottom,#000 62%,transparent); }
        .fg-art-bl { left: 0; bottom: 0; width: min(29vw, 400px); transform: rotate(180deg);
          -webkit-mask-image: linear-gradient(to bottom,#000 62%,transparent);
          mask-image: linear-gradient(to bottom,#000 62%,transparent); }
        .fg-glow-streak { position: absolute; left: -14%; right: -14%; top: 36%; height: 180px; transform: rotate(-9deg);
          filter: blur(46px); background: linear-gradient(90deg, rgba(110,40,200,.60), rgba(196,38,170,.80), rgba(80,70,255,.65)); }
        .fg-glow-blue { position: absolute; right: -3%; top: -10%; width: 36%; height: 62%;
          background: radial-gradient(closest-side, rgba(70,60,255,.55), transparent); filter: blur(30px); }
      `}</style>
            <div className="fg-backdrop" aria-hidden="true">
                <div className="fg-glow-blue" />
                <div className="fg-glow-streak" />
                <div className="fg-art-tr"><LineArt /></div>
                <div className="fg-art-bl"><LineArt /></div>
            </div>
        </>
    );
}
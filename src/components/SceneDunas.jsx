/* ─── Cena "Dunas": céu crepuscular + estrelas + dunas (assinatura do Login) ── */
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

export default function SceneDunas({ dark = false, className = "" }) {
    return (
        <svg className={`scene-dunas${className ? " " + className : ""}`} viewBox="0 0 1344 896" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <defs>
                <linearGradient id="dunas-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0"   stopColor="#442B6C"/>
                    <stop offset=".30" stopColor="#6D3F77"/>
                    <stop offset=".50" stopColor="#9A5385"/>
                    <stop offset=".68" stopColor="#C56B93"/>
                    <stop offset=".85" stopColor="#E08AA1"/>
                    <stop offset="1"   stopColor="#EA94A5"/>
                </linearGradient>
                <linearGradient id="dunas-left" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#6A4381"/>
                    <stop offset="1" stopColor="#4B2A68"/>
                </linearGradient>
                <linearGradient id="dunas-right" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#4F2D6B"/>
                    <stop offset="1" stopColor="#5E3877"/>
                </linearGradient>
                <linearGradient id="dunas-lit" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F7A5A6"/>
                    <stop offset=".55" stopColor="#DD87A2"/>
                    <stop offset="1" stopColor="#A96C95"/>
                </linearGradient>
                <linearGradient id="dunas-litBottom" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#B9709A"/>
                    <stop offset=".5" stopColor="#E88EA5"/>
                    <stop offset="1" stopColor="#BD7396"/>
                </linearGradient>
                <linearGradient id="dunas-streak" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95"/>
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
                </linearGradient>
                <radialGradient id="dunas-glow">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95"/>
                    <stop offset=".35" stopColor="#E9B6FF" stopOpacity=".55"/>
                    <stop offset="1" stopColor="#C68BFF" stopOpacity="0"/>
                </radialGradient>
            </defs>

            <rect width="1344" height="896" fill="url(#dunas-sky)"/>

            <g className="twinkle-eff">
                {BG_STARS.map(([x,y,r],i) => (
                    <g key={i}>
                        {r >= 2.4 && <circle cx={x} cy={y} r={r*3.2} fill="url(#dunas-glow)"/>}
                        <circle cx={x} cy={y} r={r} fill="#fff" opacity={r>=2.4?1:.8}/>
                    </g>
                ))}
            </g>
            {BG_STREAKS.map(([x1,y1,x2,y2,w],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#dunas-streak)" strokeWidth={w} strokeLinecap="round"/>
            ))}

            <path d="M0,640 C300,650 600,690 900,640 C1100,600 1250,650 1344,640 L1344,896 L0,896 Z" fill="#6A4381"/>

            {/* duna esquerda */}
            <path d="M0,610 C50,608 110,618 152,626 C205,590 245,562 262,563 C276,572 274,610 266,650 C258,700 205,745 232,800 C245,830 270,860 300,896 L0,896 Z" fill="url(#dunas-left)"/>
            <path d="M264,566 C300,600 360,655 405,702 C350,740 280,790 240,822 C215,780 235,730 262,690 C275,640 274,600 264,566 Z" fill="url(#dunas-lit)"/>
            <path d="M0,896 L0,800 C60,780 130,770 165,780 C178,830 172,870 160,896 Z" fill="#4B2A68"/>
            <path d="M165,782 C200,820 250,860 282,896 L160,896 C172,860 178,820 165,782 Z" fill="url(#dunas-lit)"/>

            <path d="M500,896 C560,810 690,770 800,780 C910,790 990,835 1030,896 Z" fill="url(#dunas-litBottom)"/>

            {/* duna direita */}
            <path d="M900,620 C940,590 975,558 992,556 C1020,562 1035,590 1010,612 C985,628 960,640 968,655 C1000,690 1055,705 1058,745 C1058,790 1075,815 1150,840 L1344,880 L1344,896 L800,896 Z" fill="url(#dunas-right)"/>
            <path d="M1005,563 C1100,640 1230,720 1298,762 C1250,810 1200,840 1165,850 C1100,830 1060,800 1058,745 C1055,705 1000,690 968,655 C960,640 985,628 1010,612 C1035,590 1025,565 1005,563 Z" fill="url(#dunas-lit)"/>
            <path d="M1180,676 C1250,660 1310,650 1344,640 L1344,770 L1298,762 Z" fill="#5B3673"/>
            <path d="M1085,896 C1180,860 1290,800 1344,730 L1344,896 Z" fill="#5B3673"/>

            {dark && <rect width="1344" height="896" fill="#0E0620" opacity=".45"/>}
        </svg>
    );
}
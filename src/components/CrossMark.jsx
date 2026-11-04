import { useId } from "react";

export default function CrossMark({ className = "", size, title = "Cruz cristã" }) {
    const uid = useId().replace(/:/g, "");
    const goldId = `cm-gold-${uid}`;
    const haloId = `cm-halo-${uid}`;

    return (
        <svg
            viewBox="0 0 80 104"
            className={className}
            width={size}
            height={size ? size * 1.3 : undefined}
            role="img"
            aria-label={title}
            focusable="false"
            style={{ overflow: "visible" }}
        >
            <defs>
                <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFE9A8" />
                    <stop offset="45%" stopColor="#FDB813" />
                    <stop offset="100%" stopColor="#A56B06" />
                </linearGradient>
                <radialGradient id={haloId} cx="50%" cy="34%" r="58%">
                    <stop offset="0%" stopColor="rgba(253,184,19,.26)" />
                    <stop offset="100%" stopColor="rgba(253,184,19,0)" />
                </radialGradient>
            </defs>
            <circle cx="40" cy="34" r="29" fill={`url(#${haloId})`} />
            <circle cx="40" cy="34" r="27.5" fill="none" stroke="rgba(253,184,19,.38)" strokeWidth="0.9" />
            <rect x="36.3" y="7" width="7.4" height="86" rx="3.7" fill={`url(#${goldId})`} />
            <rect x="18" y="25.3" width="44" height="7.4" rx="3.7" fill={`url(#${goldId})`} />
            <rect x="38.1" y="9.2" width="1.4" height="80" rx="0.7" fill="rgba(255,255,255,.38)" />
        </svg>
    );
}

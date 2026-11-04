import { ChevronDown } from "lucide-react";

export default function AccordionSection({ id, numero, titulo, aberto, onToggle, children }) {
    const panelId = `${id}-panel`;
    const buttonId = `${id}-button`;

    return (
        <section className={`sd-acc${aberto ? " sd-acc-open" : ""}`} id={id} aria-label={titulo}>
            <h2 className="sd-acc-heading">
                <button
                    type="button"
                    id={buttonId}
                    className="sd-acc-btn"
                    aria-expanded={aberto}
                    aria-controls={panelId}
                    onClick={onToggle}
                >
                    <span className="sd-acc-num" aria-hidden="true">{String(numero).padStart(2, "0")}</span>
                    <span className="sd-acc-title">{titulo}</span>
                    <ChevronDown
                        size={22}
                        strokeWidth={2}
                        className="sd-acc-chevron"
                        aria-hidden="true"
                    />
                </button>
            </h2>
            <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="sd-acc-panel"
            >
                <div className="sd-acc-inner">
                    {children}
                </div>
            </div>
        </section>
    );
}

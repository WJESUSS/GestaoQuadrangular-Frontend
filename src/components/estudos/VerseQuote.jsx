import { Quote } from "lucide-react";
import RichText from "./RichText.jsx";

export default function VerseQuote({ refLabel, texto, lead }) {
    return (
        <figure className="sd-verse">
            {lead && (
                <p className="sd-verse-lead"><RichText text={lead} /></p>
            )}
            <blockquote className="sd-verse-quote">
                <Quote size={18} strokeWidth={2} className="sd-verse-icon" aria-hidden="true" />
                <p>{texto}</p>
            </blockquote>
            {refLabel && <figcaption className="sd-verse-ref">— {refLabel}</figcaption>}
        </figure>
    );
}

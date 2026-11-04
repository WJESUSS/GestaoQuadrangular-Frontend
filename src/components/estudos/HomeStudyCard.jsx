import { ArrowRight, Cross } from "lucide-react";

export default function HomeStudyCard({ estudio, onLerEstudo }) {
    return (
        <article className="study-card" aria-labelledby="study-card-title">
            <div className="study-card-accent" aria-hidden="true" />
            <div className="study-card-body">
                <div className="study-card-main">
                    <div className="study-card-kicker">
                        <Cross size={13} strokeWidth={2.2} aria-hidden="true" />
                        Estudo Doutrinário
                    </div>
                    <h3 className="study-card-title" id="study-card-title">{estudio.titulo}</h3>
                    <p className="study-card-sub">{estudio.subtitulo}</p>
                    <blockquote className="study-card-verse">
                        “{estudio.versiculoChave.texto}”
                        <cite>— {estudio.versiculoChave.ref}</cite>
                    </blockquote>
                    <button type="button" className="study-card-cta" onClick={onLerEstudo}>
                        Ler estudo <ArrowRight size={16} aria-hidden="true" />
                    </button>
                </div>
                <div className="study-card-emblem" aria-hidden="true">
                    <Cross className="study-card-emblem-cross" strokeWidth={1.1} />
                </div>
            </div>
        </article>
    );
}

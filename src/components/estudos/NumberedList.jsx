import RichText from "./RichText.jsx";

export default function NumberedList({ items }) {
    return (
        <ol className="sd-num-list">
            {items.map((item) => (
                <li key={item.n} className="sd-num-item">
                    <span className="sd-num" aria-hidden="true">{item.n}</span>
                    <p className="sd-num-text"><RichText text={item.texto} /></p>
                </li>
            ))}
        </ol>
    );
}

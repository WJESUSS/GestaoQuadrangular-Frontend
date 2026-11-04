const REF_REGEX = /\[\[(.+?)\]\]/g;

export default function RichText({ text }) {
    if (!text) return null;
    const parts = String(text).split(REF_REGEX);
    return (
        <>
            {parts.map((part, i) =>
                i % 2 === 1 ? (
                    <strong key={i} className="sd-ref">{part}</strong>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}

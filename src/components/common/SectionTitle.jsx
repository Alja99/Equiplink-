export default function SectionTitle({ eyebrow, title, description, className = "" }) {
  return (
    <header className={`app-section-title ${className}`.trim()}>
      {eyebrow && <p className="app-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p className="app-section-description">{description}</p>}
    </header>
  );
}

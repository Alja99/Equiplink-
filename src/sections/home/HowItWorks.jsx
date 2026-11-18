const steps = [
  ["01", "Tell us what you need", "Share your project scope and requirements."],
  ["02", "We coordinate options", "Our team checks the local supplier network."],
  ["03", "Review the next steps", "Get a clear response and project follow-up."],
];

export default function HowItWorks() {
  return <section className="app-content"><p className="app-eyebrow">HOW IT WORKS</p><div className="app-about-grid">{steps.map(([number, title, text]) => <article key={number}><span className="app-eyebrow">{number}</span><h2>{title}</h2><p>{text}</p></article>)}</div></section>;
}

import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";

const reasons = [
  { icon: MapPin, title: "Local knowledge", text: "On-the-ground coordination with a team based in Liberia." },
  { icon: ShieldCheck, title: "Trusted network", text: "Suppliers and service partners reviewed for project readiness." },
  { icon: BadgeCheck, title: "Clear follow-through", text: "Practical updates from first enquiry through next steps." },
];

export default function WhyChooseUs() {
  return <section className="app-content"><div className="app-about-grid">{reasons.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={20} /><h2>{title}</h2><p>{text}</p></article>)}</div></section>;
}

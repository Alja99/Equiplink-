import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ServiceCard({ icon: Icon, title, description, to }) {
  return (
    <article className="app-service-card">
      {Icon && <span className="app-service-icon"><Icon size={20} /></span>}
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={to}>Explore service <ArrowRight size={14} /></Link>
    </article>
  );
}

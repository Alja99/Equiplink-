import ServiceCard from "../../components/common/ServiceCard.jsx";
import SectionTitle from "../../components/common/SectionTitle.jsx";
import { services } from "../../data/services.js";

export default function ServicesOverview() {
  return (
    <section className="app-content">
      <SectionTitle eyebrow="OUR SERVICES" title="Practical support for your operation." description="Explore the EquipLink service divisions." />
      <div className="app-about-grid">{services.map((service) => <ServiceCard key={service.to} {...service} />)}</div>
    </section>
  );
}

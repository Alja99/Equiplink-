import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import ContactCTA from "../components/common/ContactCTA.jsx";
import SectionTitle from "../components/common/SectionTitle.jsx";
import { MainLayout } from "../components/layout/MainLayout.jsx";

export default function About() {
  return (
    <MainLayout>
      <section className="app-content">
        <p className="app-eyebrow">ABOUT EQUIPLINK · LIBERIA</p>
        <h1>Local knowledge.<br />Practical business support.</h1>
        <p>EquipLink connects people and organizations with practical business services across Liberia. We bring equipment, consultancy and procurement support together through one locally connected team.</p>
        <div className="app-about-grid">
          <article><MapPin size={20} /><h2>Grounded in Liberia</h2><p>Our work is connected to local suppliers, service providers and project needs across the country.</p></article>
          <article><ShieldCheck size={20} /><h2>Built on trust</h2><p>Clear communication, careful partner coordination and transparent next steps guide every request.</p></article>
          <article><BadgeCheck size={20} /><h2>One practical partner</h2><p>From sourcing equipment to navigating business requirements, one team helps keep projects moving.</p></article>
        </div>
      </section>
      <SectionTitle eyebrow="OUR PURPOSE" title="Make it easier to get the work done." description="We help businesses find the people, equipment and supplies they need, while supporting them through the coordination that makes projects possible." />
      <ContactCTA />
    </MainLayout>
  );
}

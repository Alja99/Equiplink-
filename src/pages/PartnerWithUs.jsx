import { ArrowRight, BadgeCheck, Truck } from "lucide-react";
import ContactForm from "../components/forms/ContactForm.jsx";
import SectionTitle from "../components/common/SectionTitle.jsx";
import { MainLayout } from "../components/layout/MainLayout.jsx";

export default function PartnerWithUs() {
  return (
    <MainLayout>
      <section className="app-content">
        <p className="app-eyebrow">PARTNER NETWORK · LIBERIA</p>
        <h1>Bring your capabilities<br />to the right projects.</h1>
        <p>We work with fleet owners, manufacturers, wholesalers and local specialists to serve businesses across Liberia.</p>
        <div className="app-about-grid">
          <article><Truck size={20} /><h2>Fleet owners</h2><p>Share your equipment and mobility inventory for project rental and transport opportunities.</p></article>
          <article><BadgeCheck size={20} /><h2>Suppliers</h2><p>Connect your products and sourcing capabilities to construction and industrial requirements.</p></article>
          <article><ArrowRight size={20} /><h2>Local specialists</h2><p>Introduce your consultancy and operational services to the EquipLink partner desk.</p></article>
        </div>
      </section>
      <section className="app-content app-partner-form">
        <SectionTitle eyebrow="PARTNER ENQUIRY" title="Tell us what you bring to the network." description="Share your contact details and service capabilities. Our team will follow up to discuss verification and onboarding." />
        <ContactForm service="Partner" />
      </section>
    </MainLayout>
  );
}

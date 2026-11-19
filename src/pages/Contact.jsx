import { Globe, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "../components/forms/ContactForm.jsx";
import { MainLayout } from "../components/layout/MainLayout.jsx";
import { companyContact } from "../data/company.js";

export default function Contact() {
  return (
    <MainLayout>
      <section className="app-content">
        <p className="app-eyebrow">CONTACT · MONROVAI</p>
        <h1>Let&apos;s talk about<br />what your project needs.</h1>
        <p>Send our team a message and we&apos;ll connect you with the right service desk.</p>
        <div className="app-detail">
          <div className="app-contact-details">
            <h2>Reach the EquipLink team</h2>
            <p><Phone size={16} /><span className="app-contact-phone-list">{companyContact.phones.map((phone) => <a key={phone.href} href={phone.href}>{phone.label}</a>)}</span></p>
            <p><Mail size={16} /> <a href={companyContact.emailHref}>{companyContact.email}</a></p>
            <p><MapPin size={16} /> {companyContact.address}</p>
            <p><Globe size={16} /> <a href={companyContact.websiteHref}>{companyContact.website}</a></p>
            <p>Monday–Saturday · 08:00–18:00 GMT</p>
          </div>
          <ContactForm service="Contact" />
        </div>
      </section>
    </MainLayout>
  );
}

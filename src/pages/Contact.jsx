import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "../components/forms/ContactForm.jsx";
import { MainLayout } from "../components/layout/MainLayout.jsx";

export default function Contact() {
  return (
    <MainLayout>
      <section className="app-content">
        <p className="app-eyebrow">CONTACT · MONROVIA, LIBERIA</p>
        <h1>Let&apos;s talk about<br />what your project needs.</h1>
        <p>Send our team a message and we&apos;ll connect you with the right service desk.</p>
        <div className="app-detail">
          <div className="app-contact-details">
            <h2>Reach the EquipLink team</h2>
            <p><Phone size={16} /> <a href="tel:+231770000000">+231 77 000 0000</a></p>
            <p><Mail size={16} /> <a href="mailto:hello@equiplinkint.com">hello@equiplinkint.com</a></p>
            <p><MapPin size={16} /> Monrovia, Liberia</p>
            <p>Monday–Saturday · 08:00–18:00 GMT</p>
          </div>
          <ContactForm service="Contact" />
        </div>
      </section>
    </MainLayout>
  );
}

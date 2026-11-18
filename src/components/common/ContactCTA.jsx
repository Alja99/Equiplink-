import { ArrowRight } from "lucide-react";
import Button from "./Button.jsx";

export default function ContactCTA({
  title = "Have a project in mind?",
  description = "Tell us what you need and our local team will help you plan the next step.",
}) {
  return (
    <section className="app-contact-cta">
      <div><h2>{title}</h2><p>{description}</p></div>
      <Button to="/contact">{ "Talk to our team" } <ArrowRight size={15} /></Button>
    </section>
  );
}

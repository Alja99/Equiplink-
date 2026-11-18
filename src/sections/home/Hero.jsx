import { ArrowRight } from "lucide-react";
import Button from "../../components/common/Button.jsx";

export default function Hero() {
  return (
    <section className="app-content">
      <p className="app-eyebrow">EQUIPLINK · LIBERIA</p>
      <h1>Connecting you to the resources your business needs.</h1>
      <p>Equipment, business consultancy and procurement support, coordinated by one local team.</p>
      <Button to="/equipment-mobility">Explore our services <ArrowRight size={15} /></Button>
    </section>
  );
}

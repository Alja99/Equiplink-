import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ContactForm from "../../components/forms/ContactForm.jsx";
import { MainLayout } from "../../components/layout/MainLayout.jsx";
import { equipment } from "../../data/equipment.js";

export default function EquipmentDetails() {
  const { id } = useParams();
  const item = equipment.find((asset) => asset.id === id);

  if (!item) {
    return (
      <MainLayout>
        <section className="app-content">
          <p className="app-eyebrow">EQUIPMENT DETAILS</p>
          <h1>Equipment not found</h1>
          <p>That listing may have been removed or its link may be incorrect.</p>
          <Link className="app-button app-button-primary" to="/equipment-mobility"><ArrowLeft size={15} /> Browse equipment</Link>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="app-content">
        <Link className="app-back-link" to="/equipment-mobility"><ArrowLeft size={14} /> Back to equipment</Link>
        <div className="app-detail">
          <img src={item.image} alt={item.name} />
          <div>
            <p className="app-eyebrow">VERIFIED EQUIPMENT · {item.category.toUpperCase()}</p>
            <h1>{item.name}</h1>
            <p><MapPin size={15} /> {item.location}</p>
            <div className="app-detail-specs">{item.specs.map((spec) => <span key={spec}>{spec}</span>)}</div>
            <h2>${item.pricePerDay.toLocaleString()} <small>/ day · indicative rate</small></h2>
            <p>Request this asset and the EquipLink operations team will confirm availability, delivery options and a final project quote.</p>
            <a className="app-button app-button-primary" href="#request">Request this equipment <ArrowRight size={15} /></a>
          </div>
        </div>
        <div id="request" className="app-content app-detail-form"><h2>Request a booking</h2><ContactForm service="Equipment" equipmentName={item.name} /></div>
      </section>
    </MainLayout>
  );
}

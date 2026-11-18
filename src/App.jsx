import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  FileCheck2,
  Fuel,
  Gauge,
  HardHat,
  Headphones,
  Mail,
  MapPin,
  Menu,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Truck,
  X,
} from "lucide-react";
import {
  AdminPage,
  ConsultancyPage,
  HomePage,
  ProcurementPage,
  EquipmentPage,
} from "./Pages.jsx";

const serviceTabs = ["Equipment & Mobility", "Business Consultancy", "Procurement & Supply"];

const equipment = [
  {
    name: "Caterpillar 336 Excavator",
    category: "Excavators",
    specs: ["36,000 kg", "311 hp"],
    location: "Monrovia Depot",
    county: "Greater Monrovia",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1580901368919-7738efb0f87c?auto=format&fit=crop&w=960&q=85",
    imagePosition: "center 55%",
  },
  {
    name: "Volvo A40G Hauler",
    category: "Haulers",
    specs: ["39,000 kg payload", "469 hp"],
    location: "Buchanan Industrial Hub",
    county: "Buchanan",
    price: 650,
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=960&q=85",
    imagePosition: "center 55%",
  },
  {
    name: "Komatsu D65 Bulldozer",
    category: "Bulldozers",
    specs: ["22,000 kg", "217 hp"],
    location: "Gbarnga Staging Post",
    county: "Bong County",
    price: 550,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=960&q=85",
    imagePosition: "center 58%",
  },
  {
    name: "JCB 3CX Backhoe",
    category: "Backhoes",
    specs: ["8,000 kg", "92 hp"],
    location: "Harbel Depot",
    county: "Margibi County",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=960&q=85",
    imagePosition: "center 52%",
  },
];

const services = [
  {
    number: "01",
    icon: Truck,
    name: "Equipment & Mobility",
    subtitle: "Heavy machinery & fleet logistics",
    description:
      "Dispatch-ready earthmovers, articulated haulers, bulldozers, lowbeds, and executive SUVs.",
    bullets: [
      "Pre-mobilization mechanical certification",
      "Fuel management & standby operator teams",
      "Heavy transport escorts & permits",
    ],
    action: "Browse fleet & rental cards",
    href: "#inventory",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=85",
  },
  {
    number: "02",
    icon: FileCheck2,
    name: "Business Consultancy",
    subtitle: "Corporate mobility & compliance",
    description:
      "Practical guidance to help your people and business navigate Liberia’s regulatory landscape.",
    bullets: [
      "Work & residence permits, Class A/B and LIS",
      "Visa-on-Arrival (VoA) protocol support",
      "Liberia Business Registry, TIN & tax filings",
    ],
    action: "Explore consultancy services",
    href: "#dispatch",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
  },
  {
    number: "03",
    icon: PackageCheck,
    name: "Procurement & Supply",
    subtitle: "Industrial sourcing & supply chain",
    description:
      "Get essential materials, OEM spares, and site supplies sourced through trusted regional partners.",
    bullets: [
      "Aggregates, certified rebar & site PPE",
      "Freeport of Monrovia customs expediting",
      "Vetted distributors & consolidated billing",
    ],
    action: "Submit sourcing request",
    href: "#dispatch",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=85",
  },
];

const steps = [
  {
    number: "01",
    name: "Find your resource",
    text: "Filter machinery, regulatory services, or BOQ specifications for your project and county.",
    icon: Search,
  },
  {
    number: "02",
    name: "Request a quote",
    text: "Share your scope and receive a transparent quote from our local, verified team.",
    icon: FileCheck2,
  },
  {
    number: "03",
    name: "Secure your booking",
    text: "Review your terms, confirm deployment dates, and get clear documentation before work begins.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    name: "Delivery & execution",
    text: "We coordinate delivery to your project site, with local dispatch support when you need us.",
    icon: Truck,
  },
];

const testimonials = [
  {
    quote:
      "The equipment was flawless and the operator was incredibly professional. Kept our highway project ahead of schedule by a full week.",
    name: "Samuel Johnson",
    company: "West Africa Construction",
    role: "Site Manager",
    initials: "SJ",
  },
  {
    quote:
      "Finding specialized heavy lifters in Liberia used to be a nightmare. EquipLink delivered the right machine next day, perfectly serviced.",
    name: "David Mensah",
    company: "Golden Mining Corp",
    role: "Procurement Director",
    initials: "DM",
  },
  {
    quote:
      "Their on-site maintenance team is unmatched. When our rented wheel loader had a hydraulic issue, they fixed it within two hours.",
    name: "Michael Roberts",
    company: "Independent Contractor",
    role: "Project Contractor",
    initials: "MR",
  },
];

const faqs = [
  {
    question: "How fast can equipment be mobilized to remote counties?",
    answer:
      "Timing depends on the asset, route, and site conditions. Share your destination and target date with dispatch, and we’ll confirm availability and a realistic mobilization plan before you book.",
  },
  {
    question: "Are equipment operators included with machine rentals?",
    answer:
      "Operator arrangements vary by machine. The listing or quote will make clear whether a certified operator is included; tell us your preference when you request equipment.",
  },
  {
    question: "How does EquipLink assist with foreign work permits and VoA?",
    answer:
      "Our consultancy team can guide your business through work and residence permit requirements and Visa-on-Arrival procedures. Requirements vary, so we’ll confirm the current process for your situation.",
  },
  {
    question: "What happens if machinery malfunctions on our site?",
    answer:
      "Contact the dispatch desk as soon as possible. We’ll coordinate with the equipment provider to assess the issue and determine the appropriate support or next steps under your rental terms.",
  },
];

const partners = ["VOLVO", "KOMATSU", "CATERPILLAR", "JCB", "BOBCAT", "JOHN DEERE"];

function Logo({ footer = false }) {
  return (
    <a className={`brand${footer ? " brand-footer" : ""}`} href="#top" aria-label="EquipLink home">
      <span className="brand-symbol" aria-hidden="true">
        <span /><span /><span /><span />
      </span>
      <span className="brand-copy">
        <strong>Equip<span>Link</span></strong>
        <small>HEAVY LOGISTICS &amp; TRADE</small>
      </span>
    </a>
  );
}

function BookingModal({ asset, onClose }) {
  const [submitted, setSubmitted] = useState(false);

  if (!asset) return null;

  function submit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-heading">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
        {submitted ? (
          <div className="modal-success">
            <span className="modal-success-icon"><Check size={23} /></span>
            <p className="eyebrow">Request received</p>
            <h2>Dispatch will be in touch.</h2>
            <p>We’ll follow up about the {asset.name} and your project dates.</p>
            <button type="button" className="button button-amber" onClick={onClose}>Done <ArrowRight size={16} /></button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Direct dispatch request</p>
            <h2 id="booking-heading">Request this equipment</h2>
            <p className="modal-description">{asset.name} <span>·</span> ${asset.price} / day</p>
            <form className="booking-form" onSubmit={submit}>
              <label>Your name<input name="name" autoComplete="name" placeholder="Full name" required /></label>
              <label>Work email<input name="email" type="email" autoComplete="email" placeholder="name@company.com" required /></label>
              <div className="modal-form-row">
                <label>Start date<input name="date" type="date" required /></label>
                <label>Duration<select name="duration" defaultValue="1–3 days"><option>1–3 days</option><option>1 week</option><option>1 month</option><option>Custom</option></select></label>
              </div>
              <button type="submit" className="button button-amber button-wide">Send rental request <ArrowRight size={16} /></button>
            </form>
            <p className="modal-footnote"><ShieldCheck size={14} /> No payment required to request a quote.</p>
          </>
        )}
      </section>
    </div>
  );
}

function LegacyMarketplace() {
  const [activeTab, setActiveTab] = useState(serviceTabs[0]);
  const [equipmentType, setEquipmentType] = useState("");
  const [county, setCounty] = useState("");
  const [duration, setDuration] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [resourceMessage, setResourceMessage] = useState("");
  const [searchApplied, setSearchApplied] = useState(false);

  const filteredEquipment = useMemo(
    () => equipment.filter((asset) =>
      (!searchApplied || !equipmentType || asset.category === equipmentType) &&
      (!searchApplied || !county || county === "Nationwide" || asset.county === county),
    ),
    [county, equipmentType, searchApplied],
  );

  function findResource(event) {
    event.preventDefault();
    if (activeTab === serviceTabs[0]) {
      setSearchApplied(true);
      setResourceMessage("");
      document.querySelector("#inventory")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    document.querySelector("#dispatch")?.scrollIntoView({ behavior: "smooth" });
    setResourceMessage(
      activeTab === serviceTabs[1]
        ? "Tell our consultancy team what you need and we’ll help map out the next steps."
        : "Share the items, quantities, and delivery location you need with our sourcing team.",
    );
  }

  function resetSearch() {
    setEquipmentType("");
    setCounty("");
    setDuration("");
    setSearchApplied(false);
  }

  function submitNewsletter(event) {
    event.preventDefault();
    setNewsletterMessage("Thanks — you’re on the EquipLink update list.");
    event.currentTarget.reset();
  }

  return (
    <div id="top" className="site-shell min-h-screen bg-equiplink-night text-equiplink-copy">
      <div className="utility-bar">
        <div className="page-container utility-inner">
          <div className="utility-details">
            <a href="tel:+231770000000"><Phone size={13} /> +231 77 000 0000</a>
            <span><MapPin size={13} /> Monrovia, Liberia</span>
            <span><Clock3 size={13} /> Mon–Sat: 08:00–18:00 GMT</span>
          </div>
          <span className="dispatch-status"><i /> Dispatch operational</span>
        </div>
      </div>

      <header className="main-header">
        <div className="page-container header-inner">
          <Logo />
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={mobileMenuOpen ? "primary-nav nav-open" : "primary-nav"} aria-label="Main navigation">
            <a className="nav-active" href="#top" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#inventory" onClick={() => setMobileMenuOpen(false)}>Equipment &amp; Mobility</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>Business Consultancy</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>Procurement &amp; Supply</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>About us</a>
            <a href="#dispatch" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </nav>
          <div className="header-actions">
            <a className="header-cta" href="#resource-search">Request a service <ArrowUpRight size={15} /></a>
            <a className="portal-link" href="#dispatch"><span className="portal-avatar">A</span><span>Portal<small>Admin</small></span><ChevronDown size={14} /></a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="page-container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-mark" /> Liberia’s enterprise resource network</p>
              <h1>Connecting you to<br />the resources your<br /><em>business needs.</em></h1>
              <p className="hero-description">
                From equipment and mobility solutions to business consultancy and procurement, EquipLink connects people and organizations with practical business services across Liberia.
              </p>
              <div className="hero-actions">
                <a className="button button-amber" href="#resource-search">Explore our services <ArrowRight size={16} /></a>
                <a className="button button-outline" href="#dispatch">Request a service <ArrowUpRight size={15} /></a>
              </div>
              <div className="hero-trust"><span><ShieldCheck size={15} /> Locally coordinated</span><span><BadgeCheck size={15} /> Vetted suppliers</span></div>
            </div>
            <div className="hero-visual">
              <img
                className="hero-photo"
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=90"
                alt="Heavy machinery at a construction and earthworks site"
              />
              <div className="hero-photo-overlay" />
              <div className="hero-photo-top"><span className="live-pulse" /> FIELD OPERATIONS <span>LIBERIA / 06°18′N</span></div>
              <div className="hero-photo-caption"><span>Tier-1 fleet ready</span><strong>Direct Freeport Monrovia staging</strong></div>
              <div className="hero-operational"><span>100%</span><small>OPERATIONAL</small><span className="operational-bars"><i /><i /><i /><i /><i /></span></div>
              <span className="hero-image-index">EQUIPLINK FIELD NOTES&nbsp; / &nbsp;01—04</span>
            </div>
          </div>
          <div className="page-container">
            <form id="resource-search" className="resource-search" onSubmit={findResource}>
              <div className="search-tabs" role="tablist" aria-label="Resource type">
                {serviceTabs.map((tab) => (
                  <button
                    className={activeTab === tab ? "search-tab search-tab-active" : "search-tab"}
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => { setActiveTab(tab); setEquipmentType(""); setResourceMessage(""); }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="search-fields">
                <label className="search-field">
                  <span>{activeTab === serviceTabs[0] ? "Required equipment" : activeTab === serviceTabs[1] ? "Consultancy service" : "Product or supply"}</span>
                  <span className="search-select"><Search size={16} />
                    <select value={equipmentType} onChange={(event) => setEquipmentType(event.target.value)}>
                      <option value="">{activeTab === serviceTabs[0] ? "Choose equipment type" : activeTab === serviceTabs[1] ? "Choose a service" : "What are you sourcing?"}</option>
                      {activeTab === serviceTabs[0] ? (
                        <><option>Excavators</option><option>Bulldozers</option><option>Haulers</option><option>Backhoes</option><option>Cranes</option></>
                      ) : activeTab === serviceTabs[1] ? (
                        <><option>Work &amp; residence permits</option><option>Visa-on-Arrival</option><option>Business registration</option><option>Tax &amp; TIN support</option></>
                      ) : (
                        <><option>Construction materials</option><option>Machinery parts</option><option>Generators</option><option>Site PPE</option></>
                      )}
                    </select><ChevronDown size={15} />
                  </span>
                </label>
                <label className="search-field">
                  <span>Operational zone / county</span>
                  <span className="search-select"><MapPin size={16} />
                    <select value={county} onChange={(event) => setCounty(event.target.value)}>
                      <option value="">All counties</option><option>Greater Monrovia</option><option>Buchanan</option><option>Bong County</option><option>Margibi County</option><option>Nimba County</option><option>Nationwide</option>
                    </select><ChevronDown size={15} />
                  </span>
                </label>
                <label className="search-field duration-field">
                  <span>Deployment duration</span>
                  <span className="search-select"><Clock3 size={16} />
                    <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                      <option value="">Select duration</option><option>1–3 days</option><option>Weekly</option><option>Monthly</option><option>Custom scope</option>
                    </select><ChevronDown size={15} />
                  </span>
                </label>
                <button className="button button-amber search-submit" type="submit">Find &amp; request resource <ArrowRight size={16} /></button>
              </div>
              {resourceMessage && <p className="resource-message" role="status">{resourceMessage}</p>}
            </form>
          </div>
          <div className="page-container metrics-row">
            <div className="metric-item"><strong>150<span>+</span></strong><span>Verified machines &amp; trucks</span></div>
            <div className="metric-item"><strong>98<span>%</span></strong><span>Deployment reliability</span></div>
            <div className="metric-item"><strong>$12<span>M+</span></strong><span>Managed project deliverables</span></div>
            <div className="metric-item"><strong>15<span>/15</span></strong><span>Liberian counties covered</span></div>
          </div>
        </section>

        <section id="services" className="section-block services-section">
          <div className="page-container">
            <div className="section-heading">
              <div><p className="eyebrow"><span className="section-index">01</span> Integrated solutions portfolio</p><h2>The three core<br /><em>service divisions.</em></h2></div>
              <div className="section-intro"><p>One trusted local network for the resources, expertise, and supply chains that keep your business moving across Liberia.</p><span>BUILT AROUND YOUR OPERATION</span></div>
            </div>
            <div className="service-grid">
              {services.map(({ number, icon: Icon, name, subtitle, description, bullets, action, href, image }) => (
                <article className="service-card" key={name}>
                  <div className="service-image"><img src={image} alt="" loading="lazy" /><span className="service-number">{number} / SERVICE LINE</span><span className="service-image-icon"><Icon size={20} /></span></div>
                  <div className="service-content">
                    <p className="service-subtitle">{subtitle}</p><h3>{name}</h3><p className="service-description">{description}</p>
                    <ul>{bullets.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul>
                    <a className="service-link" href={href}>{action}<ArrowRight size={16} /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="inventory" className="section-block inventory-section">
          <div className="page-container">
            <div className="inventory-heading">
              <div><p className="eyebrow"><span className="section-index">02</span> Direct from the field</p><h2>Find available <em>machinery.</em></h2><p>Vetted equipment, ready for your next deployment.</p></div>
              <a className="text-link" href="#resource-search" onClick={resetSearch}>View all inventory <ArrowRight size={16} /></a>
            </div>
            {filteredEquipment.length > 0 ? (
              <div className="inventory-grid">
                {filteredEquipment.map((asset, index) => (
                  <article className="inventory-card" key={asset.name}>
                    <div className="inventory-photo">
                      <img src={asset.image} alt={asset.name} loading="lazy" style={{ objectPosition: asset.imagePosition }} />
                      <span className="available-badge"><i /> Available now</span>
                      <span className="inventory-ref">EL—0{index + 1}</span>
                      <span className="inventory-location"><MapPin size={13} />{asset.location}</span>
                    </div>
                    <div className="inventory-content">
                      <span className="asset-category">{asset.category} <span>·</span> Verified unit</span>
                      <h3>{asset.name}</h3>
                      <div className="asset-specs"><span><Gauge size={14} />{asset.specs[0]}</span><span><Fuel size={14} />{asset.specs[1]}</span></div>
                      <div className="asset-card-footer"><div><small>DAILY DISPATCH RATE</small><strong>${asset.price}<span> / day</span></strong></div><button className="rent-button" type="button" onClick={() => setActiveAsset(asset)}>Rent now <ArrowUpRight size={15} /></button></div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="inventory-empty"><Search size={20} /><span>No listed machines match that selection.</span><button type="button" onClick={resetSearch}>Clear search</button></div>
            )}
            <div className="inventory-note"><span><span className="live-pulse" /> Inventory verified by local dispatch</span><a href="#dispatch">Need something specific? Talk to our team <ArrowRight size={14} /></a></div>
          </div>
        </section>

        <section id="how-it-works" className="section-block process-section">
          <div className="page-container">
            <div className="section-heading process-heading"><div><p className="eyebrow"><span className="section-index">03</span> Straightforward by design</p><h2>How it <em>works.</em></h2></div><p className="process-lead">From first request to field delivery, our team helps you move from requirement to ready.</p></div>
            <div className="process-grid">
              {steps.map(({ number, name, text, icon: Icon }, index) => (
                <article className="process-step" key={number}><div className="step-top"><span>{number}</span><Icon size={18} /><div className={index === steps.length - 1 ? "step-connector step-connector-last" : "step-connector"} /></div><h3>{name}</h3><p>{text}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block proof-section">
          <div className="page-container">
            <div className="section-heading proof-heading"><div><p className="eyebrow"><span className="section-index">04</span> Trusted in the field</p><h2>Good work travels <em>far.</em></h2></div><span className="proof-caption">A FEW WORDS FROM OUR PROJECT PARTNERS</span></div>
            <div className="testimonial-grid">
              {testimonials.map((item) => (
                <article className="testimonial-card" key={item.name}><div className="testimonial-stars" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} fill="currentColor" />)}</div><p className="testimonial-quote">“{item.quote}”</p><div className="testimonial-person"><span className="person-avatar">{item.initials}</span><span><strong>{item.name}</strong><small>{item.role} · {item.company}</small></span><ArrowUpRight className="testimonial-mark" size={16} /></div></article>
              ))}
            </div>
            <div className="partners-row"><span className="partners-label">Trusted by top equipment manufacturers &amp; partners</span><div className="partner-logos">{partners.map((partner, index) => <span className={`partner-logo partner-${index}`} key={partner}>{partner}</span>)}</div></div>
          </div>
        </section>

        <section className="supplier-section">
          <div className="supplier-photo"><img src="https://images.unsplash.com/photo-1580901368919-7738efb0f87c?auto=format&fit=crop&w=1400&q=85" alt="Heavy machinery ready for work" loading="lazy" /><span>SUPPLIER NETWORK&nbsp; / &nbsp;LIBERIA</span></div>
          <div className="supplier-copy"><p className="eyebrow"><span className="section-index">05</span> Partner with EquipLink Liberia</p><h2>Turn your idle assets<br />into <em>revenue.</em></h2><p>Join our supplier network and let your heavy machinery work for you. We handle the vetting, logistics, and guarantee your payments.</p><ul><li><Check size={15} /> Guaranteed on-time payments</li><li><Check size={15} /> Fully verified &amp; insured renters</li><li><Check size={15} /> Complete schedule control</li></ul><a className="button button-amber" href="#dispatch">Become a supplier <ArrowUpRight size={16} /></a><small>ZERO LISTING FEES&nbsp; · &nbsp;KEEP 100% RATE CONTROL</small></div>
        </section>

        <section className="section-block faq-section">
          <div className="page-container faq-layout">
            <div className="faq-copy"><p className="eyebrow"><span className="section-index">06</span> Frequently asked questions</p><h2>Need to know<br /><em>before you go?</em></h2><p>Can’t find the answer? Our Monrovia dispatch team is ready to help with your project requirements.</p><a className="text-link" href="mailto:hello@equiplink.com">Ask our team <ArrowUpRight size={15} /></a></div>
            <div className="faq-list">{faqs.map((faq, index) => <details className="faq-item" key={faq.question} open={index === 0}><summary><span>{faq.question}</span><ChevronDown size={17} /></summary><p>{faq.answer}</p></details>)}</div>
          </div>
        </section>

        <section id="dispatch" className="dispatch-section">
          <div className="page-container dispatch-inner">
            <div className="dispatch-copy"><p className="eyebrow"><span className="live-pulse" /> Priority dispatch desk</p><h2>Real people.<br /><em>Ready to help.</em></h2><p>Tell us what your project needs. Our local team will help route your request to the right people.</p>{resourceMessage && <p className="resource-message dispatch-resource-message" role="status">{resourceMessage}</p>}<a className="button button-amber" href="tel:+231770000000"><Phone size={16} /> Open priority dispatch ticket <ArrowRight size={16} /></a></div>
            <div className="dispatch-contact-card"><div className="contact-card-heading"><span>MONROVIA OPERATIONS</span><span>EL / DISPATCH DESK</span></div><a href="tel:+231770000000"><span className="contact-card-icon"><Phone size={18} /></span><span><small>DIRECT PHONE HOTLINE</small><strong>+231 77 000 0000</strong><em>Mon–Sat · 08:00–18:00 GMT</em></span><ArrowUpRight size={16} /></a><a href="mailto:hello@equiplink.com"><span className="contact-card-icon"><Mail size={18} /></span><span><small>CORPORATE EMAIL</small><strong>hello@equiplink.com</strong><em>General &amp; project inquiries</em></span><ArrowUpRight size={16} /></a><div className="dispatch-address"><span className="contact-card-icon"><MapPin size={18} /></span><span><small>PHYSICAL OPERATIONS</small><strong>Freeport Industrial Strip</strong><em>Bushrod Island, Monrovia, Liberia</em></span></div><div className="contact-card-foot"><span><Compass size={14} /> LOCAL KNOWLEDGE. PRACTICAL SUPPORT.</span><span className="dispatch-live"><i /> LIVE</span></div></div>
          </div>
        </section>

        <section className="bottom-cta"><div className="page-container bottom-cta-inner"><div><p className="eyebrow"><span className="section-index">EQUIPLINK / LIBERIA</span> Your next move starts here</p><h2>Ready to upgrade your<br /><em>next project?</em></h2></div><div className="bottom-cta-actions"><a className="button button-amber" href="#resource-search">Request a quote <ArrowRight size={16} /></a><a className="button button-outline" href="#dispatch">Create an account <ArrowUpRight size={15} /></a></div></div></section>
      </main>

      <footer className="site-footer">
        <div className="page-container footer-main">
          <div className="footer-brand"><Logo footer /><p>Liberia’s premier network for heavy machinery rental, corporate mobility, business consultancy, and industrial procurement. Registered in Monrovia, Liberia.</p><form className="newsletter-form" onSubmit={submitNewsletter}><label htmlFor="newsletter">Stay informed</label><div><input id="newsletter" name="email" type="email" placeholder="corporate.email@domain.com" required /><button type="submit" aria-label="Subscribe"><ArrowRight size={17} /></button></div>{newsletterMessage && <span className="newsletter-message" role="status">{newsletterMessage}</span>}</form></div>
          <div className="footer-column"><h3>Equipment fleet</h3><a href="#inventory">Excavators &amp; earthmovers</a><a href="#inventory">Haulers &amp; tipper trucks</a><a href="#inventory">Bulldozers &amp; loaders</a><a href="#inventory">Lowbeds &amp; flatbeds</a><a href="#inventory">Car &amp; SUV fleet rental</a></div>
          <div className="footer-column"><h3>Business consultancy</h3><a href="#services">Work &amp; residence permits</a><a href="#services">Visa-on-Arrival</a><a href="#services">Business registration &amp; tax</a><a href="#services">Regulatory concessions</a><a href="#services">Local content compliance</a></div>
          <div className="footer-column footer-contact"><h3>Procurement &amp; contact</h3><a href="#services">Construction materials</a><a href="#services">Heavy machinery parts</a><a href="#services">Office &amp; industrial supplies</a><a href="#dispatch"><MapPin size={14} /> Freeport Industrial Strip, Monrovia</a><a href="tel:+231770000000"><Phone size={14} /> +231 77 000 0000</a><a href="mailto:hello@equiplink.com"><Mail size={14} /> hello@equiplink.com</a></div>
        </div>
        <div className="page-container footer-bottom"><span>© 2025 EquipLink Liberia Inc. All rights reserved.</span><span className="footer-verified"><BadgeCheck size={15} /> Verified Gov/NGO supplier</span><div><a href="#dispatch">Privacy policy</a><a href="#dispatch">Terms of service</a><a href="#dispatch">Safety standards</a></div></div>
      </footer>
      <BookingModal asset={activeAsset} onClose={() => setActiveAsset(null)} />
    </div>
  );
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const pages = {
    "/": <HomePage />,
    "/equipment": <EquipmentPage />,
    "/consultancy": <ConsultancyPage />,
    "/procurement": <ProcurementPage />,
    "/admin": <AdminPage />,
  };
  return pages[path] || <HomePage />;
}

export default App;

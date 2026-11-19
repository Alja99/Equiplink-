import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  Fuel,
  HardHat,
  Headphones,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { companyContact } from "./data/company.js";
import {
  fetchBookableEquipmentAssets,
  getSubmissionErrorMessage,
  submitEquipmentBooking,
} from "./utils/supabaseRequests.js";
import "./pages.css";

const REQUESTS_KEY = "equiplink.requests.v1";

const equipment = [
  { name: "Caterpillar 336 Excavator", type: "Excavators", category: "Earthmoving", location: "Monrovia Depot", county: "Montserrado", rate: 450, specs: ["36,000 kg", "311 HP", "Operator included"], image: "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?auto=format&fit=crop&w=960&q=85" },
  { name: "Volvo A40G Articulated Hauler", type: "Haulers", category: "Haulage", location: "Buchanan Port", county: "Grand Bassa", rate: 650, specs: ["39,000 kg load", "469 HP", "6×6 drive"], image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=960&q=85" },
  { name: "Komatsu D65 Track Bulldozer", type: "Bulldozers", category: "Earthmoving", location: "Gbarnga Yard", county: "Bong", rate: 550, specs: ["22,000 kg", "217 HP", "Track drive"], image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=960&q=85" },
  { name: "JCB 3CX Backhoe Loader", type: "Loaders", category: "Earthmoving", location: "Harbel Depot", county: "Margibi", rate: 380, specs: ["8,000 kg", "92 HP", "Multi-purpose"], image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=960&q=85" },
  { name: "SANY 50-Ton Mobile Crane", type: "Cranes", category: "Lifting", location: "Freeport Hub", county: "Montserrado", rate: 800, specs: ["43 m boom", "50 ton rating", "Rigging crew"], image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=960&q=85" },
  { name: "Toyota Land Cruiser Prado TXL", type: "SUVs", category: "Mobility", location: "Monrovia HQ", county: "Montserrado", rate: 140, specs: ["7 passengers", "Diesel turbo", "GPS telematics"], image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=960&q=85" },
];

const divisions = [
  { number: "01", icon: Truck, title: "Equipment & Mobility", text: "Machinery, transport and crewed fleet rentals, delivered where the work is.", href: "/equipment", link: "Explore the fleet" },
  { number: "02", icon: Building2, title: "Business Consultancy", text: "Practical guidance for permits, registrations and doing business in Liberia.", href: "/consultancy", link: "Explore consultancy" },
  { number: "03", icon: Package, title: "Procurement & Supply", text: "Sourcing for construction, industrial operations and essential project supplies.", href: "/procurement", link: "Explore procurement" },
];

const procurementCategories = [
  { icon: HardHat, title: "Construction Materials", text: "Cement, rebar, aggregates and geotextiles." },
  { icon: Fuel, title: "Industrial Equipment & Power", text: "Generators, pumps, compressors and power systems." },
  { icon: Wrench, title: "Machinery Parts & Hydraulics", text: "OEM parts, filters, hoses and hydraulic assemblies." },
  { icon: Package, title: "Electrical & Mechanical", text: "Cables, fittings, tools and installation supplies." },
  { icon: Building2, title: "Office & IT Furnishings", text: "Technology, furniture and workplace essentials." },
  { icon: ShieldCheck, title: "Certified Safety PPE", text: "Site-ready protective clothing and safety equipment." },
];

const consultancyServices = [
  { icon: UserRound, title: "Work permits", text: "Class A and B permit application guidance for foreign employees." },
  { icon: BadgeCheck, title: "Residence permits", text: "LIS protocol support and renewal coordination." },
  { icon: FileCheck2, title: "Visa on Arrival", text: "VoA guidance, document preparation and application follow-up." },
  { icon: Building2, title: "Business registration", text: "LBR registration, TIN setup and company documentation." },
  { icon: FileText, title: "Document authentication", text: "Notarization and verification for corporate and personnel documents." },
  { icon: Phone, title: "Ministry liaison", text: "Local coordination and direct follow-up with the relevant ministries." },
];

function readRequests() {
  try {
    const stored = window.localStorage.getItem(REQUESTS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read saved EquipLink requests.", error);
    return [];
  }
}

function SiteLayout({ children, page }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="el-site">
      <div className="el-utility"><div><span><Phone size={13} /> {companyContact.phones[0].label}</span><span><MapPin size={13} /> {companyContact.address}</span><span className="el-open"><i /> Dispatch operational</span></div></div>
      <header className="el-header">
        <a className="el-brand" href="/" aria-label="EquipLink homepage"><span className="el-brand-mark"><ArrowRight size={22} /></span><span><strong>Equip<span>Link</span></strong><small>HEAVY LOGISTICS &amp; TRADE</small></span></a>
        <button className="el-menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        <nav className={menuOpen ? "el-nav is-open" : "el-nav"} aria-label="Main navigation">
          {[["Home", "/", "home"], ["Equipment & Mobility", "/equipment", "equipment"], ["Business Consultancy", "/consultancy", "consultancy"], ["Procurement & Supply", "/procurement", "procurement"]].map(([label, href, key]) => <a key={key} className={page === key ? "is-active" : ""} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <a className="el-header-cta" href="/admin"><span>Request desk</span><ArrowUpRight size={15} /></a>
      </header>
      {children}
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return <footer className="el-footer"><div className="el-footer-main"><a className="el-brand" href="/"><span className="el-brand-mark"><ArrowRight size={22} /></span><span><strong>Equip<span>Link</span></strong><small>HEAVY LOGISTICS &amp; TRADE</small></span></a><p>Connecting people and organizations with practical business services across Liberia.</p><div><strong>Explore</strong><a href="/equipment">Equipment &amp; Mobility</a><a href="/consultancy">Business Consultancy</a><a href="/procurement">Procurement &amp; Supply</a></div><div><strong>Get in touch</strong>{companyContact.phones.map((phone) => <a key={phone.href} href={phone.href}>{phone.label}</a>)}<a href={companyContact.emailHref}>{companyContact.email}</a><a href={companyContact.websiteHref}>{companyContact.website}</a><span>{companyContact.address}</span></div></div><div className="el-footer-bottom"><span>© 2025 EquipLink Liberia Inc.</span><span><i /> Serving projects across all 15 counties</span><a href="/admin">Admin request desk</a></div></footer>;
}

function Eyebrow({ children, number }) {
  return <div className="el-eyebrow">{number && <span>{number}</span>}<i />{children}</div>;
}

function SectionTitle({ eyebrow, number, title, children }) {
  return <div className="el-section-title"><Eyebrow number={number}>{eyebrow}</Eyebrow><h2>{title}</h2>{children && <p>{children}</p>}</div>;
}

function RequestForm({ service, buttonText = "Send request", equipmentItem = "", compact = false }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(service === "Equipment");
  const submissionLock = useRef(false);
  const formAssets = equipmentItem
    ? assets.filter((asset) => asset.name.toLowerCase() === equipmentItem.toLowerCase())
    : assets;

  useEffect(() => {
    if (service !== "Equipment") return undefined;
    let active = true;
    fetchBookableEquipmentAssets()
      .then((availableAssets) => {
        if (active) setAssets(availableAssets);
      })
      .catch((assetError) => {
        if (active) setError(getSubmissionErrorMessage(assetError, "We couldn't load available equipment."));
      })
      .finally(() => {
        if (active) setAssetsLoading(false);
      });
    return () => { active = false; };
  }, [service]);

  async function submit(event) {
    event.preventDefault();
    if (submissionLock.current) return;
    submissionLock.current = true;
    setIsSubmitting(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields = Object.fromEntries(data.entries());
    try {
      const additionalRequirements = [
        fields.details,
        fields.operator && `Operator: ${fields.operator}`,
        fields.fuel && `Fuel: ${fields.fuel}`,
        fields.site && `Site notes: ${fields.site}`,
        fields.county && `County: ${fields.county}`,
        fields.item && `Requested equipment: ${fields.item}`,
      ].filter(Boolean).join("\n");

      await submitEquipmentBooking({
        ...fields,
        assetId: fields.assetId,
        startDateTime: fields.startDateTime,
        endDateTime: fields.endDateTime,
        deliveryLocation: fields.deliveryLocation,
        additionalRequirements,
      });
      form.reset();
      setError("");
      setSubmitted(true);
    } catch (saveError) {
      console.error("Could not save request.", saveError);
      setError(getSubmissionErrorMessage(saveError, "We couldn't save your request. Please try again."));
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  return <form className={`el-form${compact ? " is-compact" : ""}`} onSubmit={submit}>
    {submitted ? <div className="el-success" role="status"><CheckCircle2 size={26} /><div><strong>Request received</strong><span>Your request is in our operations queue. Our team will be in touch shortly.</span></div><button type="button" className="el-inline-link" onClick={() => setSubmitted(false)}>Send another</button></div> : <>
      {error && <p className="el-form-error" role="alert">{error}</p>}
      <div className="el-form-grid">
        <label>Full name<input name="name" autoComplete="name" required placeholder="Your full name" /></label>
        <label>Work email<input type="email" name="email" autoComplete="email" required placeholder="you@company.com" /></label>
        <label>Company<input name="company" autoComplete="organization" placeholder="Company name" /></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" placeholder="+231" /></label>
        {service === "Equipment" && <>
          <label>Equipment / service<input name="item" defaultValue={equipmentItem} placeholder="What do you need?" /></label>
          <label className="el-form-wide">Physical asset to reserve<select name="assetId" required defaultValue="" disabled={assetsLoading || assets.length === 0}>
            <option value="">{assetsLoading ? "Loading available assets..." : formAssets.length ? "Select a physical asset" : equipmentItem ? "No available assets for this model" : "No available assets"}</option>
            {formAssets.map((asset) => <option key={asset.asset_id} value={asset.asset_id}>{asset.name} · {asset.asset_code} · {asset.location}</option>)}
          </select></label>
          <label>County / delivery hub<select name="county" defaultValue=""><option value="">Select a location</option>{["Montserrado", "Grand Bassa", "Bong", "Margibi", "Nimba", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Start date and time<input type="datetime-local" name="startDateTime" required /></label>
          <label>End date and time<input type="datetime-local" name="endDateTime" required /></label>
          <label className="el-form-wide">Delivery location<input name="deliveryLocation" required placeholder="Project site or delivery address" /></label>
          <label>Operator preference<select name="operator" defaultValue="Operator included"><option>Operator included</option><option>Equipment only</option><option>Advise me</option></select></label>
          <label>Fuel management<select name="fuel" defaultValue="Supplier fuel"><option>Supplier fuel</option><option>Customer fuel</option><option>Advise me</option></select></label>
          <label className="el-form-wide">Site coordinates / delivery notes<input name="site" placeholder="Project site, GPS coordinates or access notes" /></label>
        </>}
        {service === "Consultancy" && <>
          <label>Practice area<select name="practice" required defaultValue=""><option value="">Choose a service</option>{consultancyServices.map((item) => <option key={item.title}>{item.title}</option>)}</select></label>
          <label>Urgency<select name="urgency" defaultValue="Standard"><option>Standard</option><option>Urgent</option><option>Time-sensitive</option></select></label>
          <label>Personnel headcount<input name="headcount" type="number" min="1" placeholder="Number of applicants" /></label>
          <label>Target completion date<input name="targetDate" type="date" /></label>
          <label className="el-form-wide">How can we help?<textarea name="details" rows="3" placeholder="Tell us about your requirements" /></label>
          <label className="el-form-wide">Supporting documents<input name="attachment" type="file" /></label>
        </>}
        {service === "Procurement" && <>
          <label>Sourcing division<select name="division" required defaultValue=""><option value="">Choose a division</option>{procurementCategories.map((item) => <option key={item.title}>{item.title}</option>)}</select></label>
          <label>Delivery terminal<select name="terminal" defaultValue=""><option value="">Select a location</option>{["Monrovia / Freeport", "Buchanan Port", "Harper Port", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>OEM / part number<input name="partNumber" placeholder="If applicable" /></label>
          <label>Unit of measure<input name="unit" placeholder="e.g. pieces, tons, sets" /></label>
          <label className="el-form-wide">Bill of quantities / technical specifications<textarea name="details" rows="4" required placeholder="List items, quantities, specifications and preferred brands" /></label>
          <label className="el-form-wide">Attach BOQ / specifications<input name="attachment" type="file" /></label>
        </>}
        {service === "Equipment" && <label className="el-form-wide">Project details<textarea name="details" rows="3" placeholder="Scope, equipment needs or additional requirements" /></label>}
      </div>
      <button className="el-button el-button-primary el-form-submit" type="submit" disabled={isSubmitting || (service === "Equipment" && (assetsLoading || formAssets.length === 0))} aria-busy={isSubmitting}>{isSubmitting ? "Submitting..." : buttonText}<ArrowRight size={16} /></button>
      <small className="el-form-note"><ShieldCheck size={14} /> No payment required to request a quote.</small>
    </>}
  </form>;
}

function HomePage() {
  const [finder, setFinder] = useState("");
  return <SiteLayout page="home">
    <main>
      <section className="el-home-hero">
        <div className="el-hero-copy"><Eyebrow>LIBERIA'S HEAVY LOGISTICS &amp; TRADE NETWORK</Eyebrow><h1>Connecting you to the resources <em>your business needs.</em></h1><p>From equipment and mobility solutions to business consultancy and procurement, EquipLink connects people and organizations with practical business services across Liberia.</p><div className="el-hero-actions"><a className="el-button el-button-primary" href="#services">Explore our services <ArrowDown size={16} /></a><a className="el-button el-button-outline" href="/admin">Request a service <ArrowUpRight size={16} /></a></div><div className="el-hero-trust"><span><ShieldCheck size={15} /> Vetted local partners</span><span><BadgeCheck size={15} /> Verified service requests</span></div></div>
        <div className="el-hero-visual"><img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=85" alt="Construction equipment at work on a site" /><div className="el-hero-shade" /><div className="el-hero-image-caption"><span><i /> DISPATCH NETWORK OPERATIONAL</span><strong>Built for business on the ground.</strong><small>MONROVIA · LIBERIA</small></div><div className="el-stat-float"><span>ACROSS LIBERIA</span><strong>15</strong><small>counties covered</small></div></div>
        <form className="el-quick-finder" onSubmit={(event) => { event.preventDefault(); window.location.href = `/equipment?search=${encodeURIComponent(finder)}`; }}><div><Search size={17} /><input value={finder} onChange={(event) => setFinder(event.target.value)} placeholder="What does your project need?" aria-label="Search services" /></div><select aria-label="Service category" onChange={(event) => { if (event.target.value) window.location.href = event.target.value; }} defaultValue=""><option value="">All service divisions</option><option value="/equipment">Equipment &amp; Mobility</option><option value="/consultancy">Business Consultancy</option><option value="/procurement">Procurement &amp; Supply</option></select><button className="el-button el-button-primary" type="submit">Find resources <ArrowRight size={16} /></button></form>
      </section>

      <section id="services" className="el-section el-divisions"><SectionTitle eyebrow="ONE PARTNER. THREE SOLUTIONS." number="01" title={<>Everything your operation needs, <em>in one place.</em></>}><span>Practical local expertise, dependable service, and one team to help you move projects forward.</span></SectionTitle><div className="el-division-grid">{divisions.map(({ number, icon: Icon, title, text, href, link }) => <article className="el-division-card" key={title}><span className="el-card-number">{number}</span><span className="el-division-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p><a href={href}>{link}<ArrowRight size={15} /></a></article>)}</div></section>

      <section className="el-featured"><div className="el-featured-top"><SectionTitle eyebrow="READY WHEN YOU ARE" number="02" title={<>Live machinery <em>inventory.</em></>}><span>Selected equipment available through our verified local network.</span></SectionTitle><a className="el-inline-link" href="/equipment">Browse all equipment <ArrowRight size={15} /></a></div><div className="el-featured-grid">{equipment.slice(0, 3).map((item) => <EquipmentCard key={item.name} item={item} />)}</div></section>

      <section className="el-section el-how"><SectionTitle eyebrow="A CLEAR PATH FORWARD" number="03" title={<>From first request to <em>on-site.</em></>}><span>One point of contact. Clear steps. Local follow-through.</span></SectionTitle><div className="el-steps">{[["01", "Tell us what you need", "Share your scope, timeline and site requirements."], ["02", "We source the right fit", "Our local network finds vetted suppliers and specialists."], ["03", "Review your options", "Get a clear response, quote and next steps."], ["04", "Move your project forward", "We coordinate delivery and stay connected on the ground."]].map(([number, title, text]) => <article key={number}><span>{number}</span><i /><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="el-story"><div><Eyebrow>TRUSTED ON THE GROUND</Eyebrow><h2>Local knowledge.<br /><em>Practical results.</em></h2><p>EquipLink brings together the people, services and supply chains that help businesses get work done in Liberia.</p><a className="el-inline-link" href="/consultancy">Get to know our services <ArrowRight size={15} /></a></div><blockquote><span>“</span><p>Reliable equipment, clear communication and a local team that understands what it takes to deliver on site.</p><footer><i>AC</i><span><strong>Project Operations</strong><small>Infrastructure partner · Liberia</small></span></footer></blockquote></section>

      <section className="el-supplier-banner"><div><Eyebrow>FOR LIBERIAN FLEET OWNERS</Eyebrow><h2>Turn your idle assets into <em>revenue.</em></h2><p>Join our verified supplier network and connect your equipment with real project demand.</p></div><a className="el-button el-button-primary" href="/equipment#supplier">List your fleet <ArrowUpRight size={16} /></a></section>
    </main>
  </SiteLayout>;
}

function EquipmentPage() {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState("All equipment");
  const [county, setCounty] = useState("All counties");
  const [selected, setSelected] = useState("");
  const filtered = useMemo(() => equipment.filter((item) => (category === "All equipment" || item.category === category || item.type === category) && (county === "All counties" || item.county === county) && `${item.name} ${item.type} ${item.location}`.toLowerCase().includes(search.toLowerCase())), [category, county, search]);
  return <SiteLayout page="equipment"><main>
    <PageHero eyebrow="EQUIPMENT & MOBILITY" title={<>The right equipment.<br /><em>Right where you need it.</em></>} text="Find trusted heavy equipment, trucks, operators and mobility solutions across Liberia — with local dispatch support from request to delivery." image="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=85" />
    <section className="el-catalog-page"><SectionTitle eyebrow="VERIFIED FLEET" number="01" title={<>Mobilization-ready <em>assets.</em></>}><span>Rates are indicative. Submit a request for confirmed availability and a project quote.</span></SectionTitle>
      <div className="el-filter-bar"><label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search equipment or model" /></label><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All equipment</option>{["Earthmoving", "Haulage", "Lifting", "Mobility", "Excavators", "Bulldozers", "Loaders", "Cranes", "SUVs"].map((item) => <option key={item}>{item}</option>)}</select><select value={county} onChange={(event) => setCounty(event.target.value)}><option>All counties</option>{["Montserrado", "Grand Bassa", "Bong", "Margibi", "Nimba"].map((item) => <option key={item}>{item}</option>)}</select><span className="el-result-count"><i /> {filtered.length} units listed</span></div>
      {filtered.length ? <div className="el-equipment-grid">{filtered.map((item) => <EquipmentCard key={item.name} item={item} onRequest={() => setSelected(item.name)} />)}</div> : <div className="el-empty-state">No equipment matches those filters. Try another location or search.</div>}
    </section>
    <section className="el-supplier-banner" id="supplier"><div><Eyebrow>SUPPLIER NETWORK</Eyebrow><h2>Your fleet can do more. <em>Let&apos;s put it to work.</em></h2><p>Local fleet owners are invited to list verified machinery and mobility assets with EquipLink.</p></div><a className="el-button el-button-primary" href="#supplier-form">Register as a supplier <ArrowRight size={16} /></a></section>
    <section className="el-request-section" id="supplier-form"><div><Eyebrow>REQUEST &amp; SOURCE</Eyebrow><h2>Need an asset that&apos;s <em>not listed?</em></h2><p>Tell us what your project needs. We&apos;ll check our wider supplier network and get back to you.</p><div className="el-support-point"><Headphones size={17} /><span><strong>Local dispatch support</strong><small>Talk directly with our Monrovia operations team.</small></span></div></div><RequestForm service="Equipment" buttonText="Request equipment" /></section>
    {selected && <div className="el-modal-shade" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(""); }}><section className="el-modal" role="dialog" aria-modal="true" aria-labelledby="equipment-request-title"><button className="el-modal-close" onClick={() => setSelected("")} aria-label="Close request"><X size={19} /></button><Eyebrow>DIRECT DISPATCH DESK</Eyebrow><h2 id="equipment-request-title">Request this asset</h2><p>{selected} · Our team will confirm availability and pricing.</p><RequestForm service="Equipment" equipmentItem={selected} buttonText="Send booking request" compact /></section></div>}
  </main></SiteLayout>;
}

function ConsultancyPage() {
  return <SiteLayout page="consultancy"><main>
    <PageHero eyebrow="BUSINESS CONSULTANCY" title={<>Navigate the process.<br /><em>Build with confidence.</em></>} text="Practical local guidance for permits, company registration and business operations in Liberia. We help you understand the steps and keep the paperwork moving." image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85" />
    <section className="el-section el-practices"><SectionTitle eyebrow="LOCAL EXPERTISE" number="01" title={<>Business support, <em>made clearer.</em></>}><span>Experienced coordination for the regulatory and administrative steps your team needs to take.</span></SectionTitle><div className="el-service-grid">{consultancyServices.map(({ icon: Icon, title, text }, index) => <article key={title}><span className="el-service-index">0{index + 1}</span><i><Icon size={20} /></i><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="el-roadmap"><div className="el-roadmap-intro"><Eyebrow>YOUR CLEARANCE ROADMAP</Eyebrow><h2>Clear steps.<br /><em>Consistent follow-through.</em></h2><p>We help you understand what is needed at each stage, coordinate submissions and keep you informed as your application progresses.</p></div><div className="el-roadmap-steps">{[["01", "Initial consultation", "We understand your requirements, timing and documentation."], ["02", "Document preparation", "We review your files and prepare a complete application."], ["03", "Submission & liaison", "Our local desk coordinates submission with the relevant ministry."], ["04", "Follow-up & completion", "We track progress and keep your team updated through the outcome."]].map(([n, title, text]) => <article key={n}><span>{n}</span><div><strong>{title}</strong><p>{text}</p></div><CheckCircle2 size={17} /></article>)}</div></section>
    <section className="el-request-section"><div><Eyebrow>CONSULTANCY ENQUIRY</Eyebrow><h2>Let&apos;s understand <em>your situation.</em></h2><p>Share your requirements and our EquipLink liaison desk will follow up with the right next steps.</p><div className="el-support-point"><MapPin size={17} /><span><strong>Ministry liaison desk</strong><small>Our office: {companyContact.address}</small></span></div></div><RequestForm service="Consultancy" buttonText="Submit consultancy enquiry" /></section>
  </main></SiteLayout>;
}

function ProcurementPage() {
  return <SiteLayout page="procurement"><main>
    <PageHero eyebrow="PROCUREMENT & SUPPLY" title={<>Source with confidence.<br /><em>Keep operations moving.</em></>} text="One dependable point of contact for project materials, industrial equipment, machinery parts and essential supplies — delivered through trusted local and international partners." image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85" />
    <section className="el-section el-practices"><SectionTitle eyebrow="OUR SOURCING DIVISIONS" number="01" title={<>From the job site to <em>the supply chain.</em></>}><span>Send us your BOQ or specifications. We&apos;ll coordinate sourcing, quotation and delivery options.</span></SectionTitle><div className="el-service-grid el-procurement-grid">{procurementCategories.map(({ icon: Icon, title, text }, index) => <article key={title}><span className="el-service-index">0{index + 1}</span><i><Icon size={20} /></i><h3>{title}</h3><p>{text}</p><a href="#inquiry-form">Request sourcing <ArrowRight size={14} /></a></article>)}</div></section>
    <section className="el-supply-promise"><div><Eyebrow>BUILT AROUND YOUR BOQ</Eyebrow><h2>Clear specifications.<br /><em>Reliable delivery.</em></h2><p>We work with your project team to confirm product specifications, manufacturer options and the most practical delivery route to your project terminal.</p></div><div className="el-promise-list">{[["01", "Specification review", "We clarify quantities, standards and compatible alternatives."], ["02", "Supplier coordination", "We connect with manufacturers and accredited wholesalers."], ["03", "Quote & delivery planning", "Compare options with transparent logistics and delivery terms."]].map(([n, title, text]) => <article key={n}><span>{n}</span><div><strong>{title}</strong><small>{text}</small></div><ArrowUpRight size={16} /></article>)}</div></section>
    <section className="el-request-section" id="inquiry-form"><div><Eyebrow>BOQ &amp; SUPPLY INQUIRY</Eyebrow><h2>Tell us what your <em>project needs.</em></h2><p>Provide item details and delivery preferences. Attach a bill of quantities or technical specifications to help us prepare an accurate response.</p><div className="el-support-point"><Package size={17} /><span><strong>Six sourcing divisions</strong><small>From construction materials to certified site PPE.</small></span></div></div><RequestForm service="Procurement" buttonText="Submit supply inquiry" /></section>
    <section className="el-partner-band"><span><BadgeCheck size={20} /> FOR MANUFACTURERS &amp; WHOLESALERS</span><p>Interested in supplying projects in Liberia? Join our accredited partner network.</p><a href={`${companyContact.emailHref}?subject=Supplier%20partnership`}>Partner with EquipLink <ArrowUpRight size={15} /></a></section>
  </main></SiteLayout>;
}

function PageHero({ eyebrow, title, text, image }) {
  return <section className="el-page-hero"><div className="el-page-hero-copy"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{text}</p><a className="el-button el-button-primary" href="#services" onClick={(event) => { const target = document.querySelector(".el-request-section, .el-practices"); if (target) { event.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); } }}>Talk to our team <ArrowRight size={16} /></a><div className="el-hero-trust"><span><ShieldCheck size={15} /> Local expertise</span><span><CheckCircle2 size={15} /> Clear next steps</span></div></div><div className="el-page-hero-image"><img src={image} alt="" /><span><i /> EQUIPLINK · LIBERIA</span></div></section>;
}

function EquipmentCard({ item, onRequest }) {
  return <article className="el-equipment-card"><div className="el-equipment-image"><img src={item.image} alt={item.name} loading="lazy" /><span className="el-availability"><i /> Available on request</span><span className="el-equipment-loc"><MapPin size={12} />{item.location}</span></div><div className="el-equipment-content"><div className="el-equipment-tags"><span>{item.type}</span><span>Verified fleet</span></div><h3>{item.name}</h3><div className="el-specs">{item.specs.map((spec) => <span key={spec}><Check size={12} />{spec}</span>)}</div><div className="el-equipment-bottom"><span><small>INDICATIVE DAILY RATE</small><strong>${item.rate.toLocaleString()} <i>/ day</i></strong></span>{onRequest ? <button onClick={onRequest}>Request asset <ArrowUpRight size={15} /></button> : <a href="/equipment">View fleet <ArrowUpRight size={15} /></a>}</div></div></article>;
}

function AdminPage() {
  const [requests, setRequests] = useState(readRequests);
  const [filter, setFilter] = useState("All requests");
  const [selectedId, setSelectedId] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("Requests");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setRequests(readRequests());
    window.addEventListener("storage", refresh);
    window.addEventListener("equiplink:requests-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("equiplink:requests-changed", refresh);
    };
  });

  const selected = requests.find((item) => item.id === selectedId) || requests[0];
  const filtered = requests.filter((item) => (filter === "All requests" || item.service === filter) && `${item.name || ""} ${item.company || ""} ${item.item || ""} ${item.id}`.toLowerCase().includes(search.toLowerCase()));
  const pending = requests.filter((item) => item.status === "Pending Review").length;
  const activeValue = requests.filter((item) => item.status !== "Pending Review").length * 1250;

  function updateStatus(request, status, message) {
    try {
      const updated = requests.map((item) => item.id === request.id ? { ...item, status, updatedAt: new Date().toISOString() } : item);
      window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
      setRequests(updated);
      setNotice(`${message}: ${request.id}`);
      window.setTimeout(() => setNotice(""), 3500);
    } catch (error) {
      console.error("Could not update request status.", error);
      setNotice("Could not save this update. Check browser storage and try again.");
    }
  }

  return <div className="el-admin"><aside className={`el-admin-sidebar${adminMenuOpen ? " mobile-open" : ""}`}><a className="el-brand" href="/"><span className="el-brand-mark"><ArrowRight size={22} /></span><span><strong>Equip<span>Link</span></strong><small>OPERATIONS DESK</small></span></a><div className="el-admin-workspace"><span>AC</span><div><strong>EquipLink Operations</strong><small>Administrator</small></div><ChevronDown size={14} /></div><p className="el-admin-label">WORKSPACE</p>{[["Requests", FileText], ["Fleet deployment", Truck], ["Maintenance", Wrench], ["Reports", Package]].map(([label, Icon]) => <button key={label} className={`el-admin-nav${view === label ? " active" : ""}`} onClick={() => { setView(label); setAdminMenuOpen(false); }}><Icon size={17} />{label}{label === "Requests" && pending > 0 && <span>{pending}</span>}</button>)}<div className="el-admin-bottom"><a href="/">← Back to website</a><div className="el-admin-user"><i>JD</i><span><strong>Jordan Davis</strong><small>Operations admin</small></span><ChevronDown size={14} /></div></div></aside>
    {adminMenuOpen && <button className="el-admin-scrim" aria-label="Close admin navigation" onClick={() => setAdminMenuOpen(false)} />}
    <main className="el-admin-main"><header className="el-admin-top"><div><button className="el-admin-menu-toggle" aria-label="Open admin navigation" aria-expanded={adminMenuOpen} onClick={() => setAdminMenuOpen(!adminMenuOpen)}><Menu size={18} /></button><span>Operations</span><ChevronRight size={14} /><strong>{view}</strong></div><div><span className="el-admin-live"><i /> All systems operational</span><button aria-label="Notifications"><Bell size={17} /></button><span className="el-admin-user-avatar">JD</span></div></header>
      <div className="el-admin-content"><div className="el-admin-heading"><div><Eyebrow>OPERATIONS OVERVIEW</Eyebrow><h1>{view === "Requests" ? "Request management" : view}</h1><p>Review and coordinate requests from across the EquipLink network.</p></div><span className="el-date"><CalendarDays size={15} /> Today <ChevronDown size={13} /></span></div>
      {notice && <div className="el-admin-notice" role="status"><CheckCircle2 size={16} />{notice}<button onClick={() => setNotice("")}><X size={15} /></button></div>}
      <div className="el-admin-metrics"><AdminMetric label="Total requests" value={String(requests.length)} caption="Across all service lines" icon={<FileText size={17} />} /><AdminMetric label="Active pipeline value" value={`$${activeValue.toLocaleString()}`} caption="Estimated active value" icon={<Banknote size={17} />} /><AdminMetric label="Pending approvals" value={String(pending)} caption="Require review" icon={<Clock3 size={17} />} alert={pending > 0} /><AdminMetric label="Average response time" value="34 min" caption="Within 1-hour SLA" icon={<ActivityIcon />} /></div>
      {view === "Requests" ? <div className="el-admin-grid"><section className="el-admin-panel el-requests-panel"><div className="el-admin-panel-head"><div><h2>Service pipeline</h2><p>Incoming and in-progress requests</p></div><button className="el-admin-export" onClick={() => { const csv = ["ID,Service,Name,Company,Status", ...requests.map((r) => [r.id, r.service, r.name, r.company, r.status].map((v) => `"${String(v || "").replaceAll('"', '""')}"`).join(","))].join("\n"); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "equiplink-requests.csv"; link.click(); URL.revokeObjectURL(link.href); }}><ArrowDown size={14} /> Export</button></div>
        <div className="el-request-toolbar"><div className="el-admin-tabs">{["All requests", "Equipment", "Consultancy", "Procurement"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><label><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests" /></label></div>
        {filtered.length ? <div className="el-request-table-wrap"><table className="el-request-table"><thead><tr><th>REQUEST</th><th>SERVICE</th><th>SUBMITTED</th><th>STATUS</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className={selected?.id === item.id ? "selected" : ""} onClick={() => setSelectedId(item.id)}><td><strong>{item.name || "New enquiry"}</strong><small>{item.id} · {item.company || item.email}</small></td><td><span className={`el-service-chip ${String(item.service).toLowerCase()}`}>{item.service}</span></td><td>{new Date(item.createdAt).toLocaleDateString()}</td><td><Status status={item.status} /></td><td><ChevronRight size={15} /></td></tr>)}</tbody></table></div> : <div className="el-admin-empty"><FileText size={23} /><strong>No requests yet</strong><span>Website enquiries will appear here as soon as they are submitted.</span><a href="/equipment">Open the equipment page <ArrowUpRight size={14} /></a></div>}
        <div className="el-table-foot">Showing {filtered.length} of {requests.length} requests <span>Updates are saved in this browser</span></div>
      </section>
      <aside className="el-admin-panel el-dossier">{selected ? <><div className="el-dossier-top"><div><span>REQUEST DOSSIER</span><button aria-label="More request actions">···</button></div><strong>{selected.service} request</strong><small>{selected.id} · {new Date(selected.createdAt).toLocaleString()}</small></div><Status status={selected.status} /><div className="el-dossier-section"><h3>Client details</h3><p><UserRound size={14} /><span><strong>{selected.name || "Not provided"}</strong><small>Contact name</small></span></p><p><Building2 size={14} /><span><strong>{selected.company || "Independent"}</strong><small>Organization</small></span></p><p><Mail size={14} /><span><strong>{selected.email || "No email provided"}</strong><small>Email address</small></span></p>{selected.phone && <p><Phone size={14} /><span><strong>{selected.phone}</strong><small>Phone number</small></span></p>}</div><div className="el-dossier-section"><h3>Request details</h3><p><Package size={14} /><span><strong>{selected.item || selected.practice || selected.division || selected.service}</strong><small>{selected.county || selected.terminal || "Service line"}</small></span></p>{selected.details && <blockquote>{selected.details}</blockquote>}{selected.attachment && <div className="el-attachment"><FileText size={15} /><span><strong>{selected.attachment}</strong><small>Attachment noted by submitter</small></span><CheckCircle2 size={14} /></div>}</div><div className="el-dossier-actions">{selected.service === "Equipment" ? <button onClick={() => updateStatus(selected, "Dispatched", "Booking confirmed and dispatch initiated")}><Truck size={15} />Confirm booking &amp; dispatch</button> : selected.service === "Consultancy" ? <button onClick={() => updateStatus(selected, "Docs Verified", "Documents verified and ministry liaison lodged")}><FileCheck2 size={15} />Lodge with ministry</button> : <button onClick={() => updateStatus(selected, "Quote Prepared", "Supply quote marked prepared")}><Send size={15} />Prepare &amp; send invoice</button>}<button className="secondary" onClick={() => setNotice(`Client notification queued for ${selected.email || selected.name || selected.id}`)}><Mail size={14} />Notify client by email / SMS</button><small>Action changes are synchronized with the website request queue.</small></div></> : <div className="el-admin-empty"><span>Select a request to review the dossier.</span></div>}</aside></div> : <div className="el-admin-panel el-placeholder-view"><span className="el-service-icon"><Truck size={22} /></span><h2>{view}</h2><p>This operations view is ready for your live {view.toLowerCase()} data.</p><div className="el-mini-stats"><span><strong>{view === "Maintenance" ? "2" : "15"}</strong> active {view === "Maintenance" ? "service calls" : "regions covered"}</span><span><strong>100%</strong> local visibility</span></div></div>}
      <section className="el-deployment"><div><h2>Fleet deployment</h2><p>Operations coverage across Liberia</p></div><div className="el-map-grid">{["Montserrado", "Grand Bassa", "Bong", "Margibi", "Nimba", "Grand Cape Mount", "Lofa", "Sinoe", "Maryland", "River Gee", "Grand Gedeh", "River Cess", "Bomi", "Gbarpolu", "Grand Kru"].map((item, index) => <span key={item} className={index % 4 === 1 ? "busy" : index % 4 === 2 ? "medium" : ""}><i />{item}</span>)}</div></section>
      <footer className="el-admin-footer"><span>EquipLink Operations · Request desk</span><span><i /> Request queue synced in this browser</span></footer>
      </div>
    </main></div>;
}

function AdminMetric({ label, value, caption, icon, alert }) {
  return <article className="el-admin-panel el-admin-metric"><span className="el-admin-metric-icon">{icon}</span><small>{label}</small><strong>{value}</strong><span className={alert ? "is-alert" : ""}>{caption}</span></article>;
}

function ActivityIcon() {
  return <Clock3 size={17} />;
}

function Status({ status }) {
  const tone = status === "Pending Review" ? "pending" : status === "Docs Verified" ? "verified" : status === "Quote Prepared" ? "quoted" : "dispatched";
  return <span className={`el-status ${tone}`}><i />{status}</span>;
}

export { AdminPage, ConsultancyPage, HomePage, ProcurementPage, EquipmentPage };

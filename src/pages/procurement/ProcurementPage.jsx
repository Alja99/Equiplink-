import { useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Box,
  Cable,
  Check,
  CheckCircle2,
  Clock3,
  Container,
  FileCheck2,
  FileText,
  Fuel,
  HardHat,
  Headphones,
  LockKeyhole,
  MapPin,
  PackageCheck,
  Phone,
  Radio,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import { MainLayout } from "../../components/layout/MainLayout.jsx";
import { companyContact } from "../../data/company.js";
import {
  getSubmissionErrorMessage,
  submitProcurementRequest,
  uploadRequestAttachment,
} from "../../utils/supabaseRequests.js";
import "./procurement.css";

const categories = [
  {
    number: "01",
    title: "Construction Materials",
    badge: "BULK READY",
    group: "Heavy Site",
    icon: HardHat,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85",
    description: "Structural-grade commodities supplied with verified mill test certificates and bulk port clearing.",
    items: ["42.5R / 52.5N Portland cement", "ASTM A615 / BS4449 rebar, 8–32 mm", "Galvanized roofing, beams & geotextiles", "Culvert pipes and construction aggregate"],
    leadTime: "24H – 5 DAYS",
  },
  {
    number: "02",
    title: "Equipment & Power Generation",
    badge: "HEAVY DUTY",
    group: "Mechanical & Power",
    icon: Fuel,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=85",
    description: "Prime and standby power assets and industrial auxiliaries built for demanding site conditions.",
    items: ["Diesel generators, 20 kVA–1500 kVA", "Rotary screw compressors and dryers", "High-head mining dewatering pumps", "Solar microgrids and hybrid inverters"],
    leadTime: "IMMEDIATE – 14 DAYS",
  },
  {
    number: "03",
    title: "Parts & Hydraulics",
    badge: "OEM GENUINE",
    group: "Mechanical & Power",
    icon: Wrench,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=85",
    description: "Critical wear parts and hydraulic components to help minimize downtime across heavy fleets.",
    items: ["Bucket teeth, adapters and cutting edges", "Hydraulic pumps, seals and cylinders", "Track chains, rollers and undercarriage", "Heavy OTR tyres for articulated haulers"],
    leadTime: "48H AIR / 20D SEA",
  },
  {
    number: "04",
    title: "Electrical & Mechanical",
    badge: "IEC SPECIFIED",
    group: "Mechanical & Power",
    icon: Cable,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=85",
    description: "Industrial electrical infrastructure and high-pressure fluid-handling components.",
    items: ["XLPE steel-wire-armoured copper cables", "11 kV / 400 V step-up and step-down transformers", "Distribution switchgear and circuit breakers", "Cast-steel valves, HDPE flanges and pipe"],
    leadTime: "3 – 10 DAYS",
  },
  {
    number: "05",
    title: "Corporate & Site Facility",
    badge: "TURNKEY SETUP",
    group: "Heavy Site",
    icon: Box,
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
    description: "Workplace fit-outs, remote camp furnishings and enterprise communications for project teams.",
    items: ["Durable workstations and ergonomic seating", "Server racks, network switches and satellite comms", "Industrial multifunction copiers", "Modular field offices and living units"],
    leadTime: "IMMEDIATE – 7 DAYS",
  },
  {
    number: "06",
    title: "Safety & Site Consumables",
    badge: "OSHA / EN397",
    group: "Heavy Site",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85",
    description: "Occupational safety gear, personal protection and rapid spill-response supplies.",
    items: ["EN ISO 20471 high-vis & flame-retardant workwear", "Fall-arrest harnesses and lanyards", "Hydrocarbon and chemical spill kits", "Industrial first-aid and trauma kits"],
    leadTime: "MONROVIA STOCK",
  },
];

const pipeline = [
  ["01", "Spec verification", "Review the BOQ, OEM codes, tolerances and operating conditions at your site."],
  ["02", "Supplier vetting", "Compare qualified manufacturer and wholesaler options for availability and pricing."],
  ["03", "Pro-forma & terms", "Prepare a transparent quote with agreed CIF/DDP terms and logistics costs."],
  ["04", "Inspection & delivery", "Coordinate inspection, port clearance and onward delivery planning to your site."],
];

const routes = {
  "Yekepa / Nimba Mining Concession": { Monrovia: "14–18 hours", Buchanan: "10–14 hours", Robertsport: "18–24 hours" },
  "Buchanan Hub": { Monrovia: "3–5 hours", Buchanan: "Under 1 hour", Robertsport: "8–12 hours" },
  "Gbarnga / Bong County": { Monrovia: "5–7 hours", Buchanan: "6–9 hours", Robertsport: "9–13 hours" },
  "Monrovia Central": { Monrovia: "1–2 hours", Buchanan: "3–5 hours", Robertsport: "4–6 hours" },
};

const destinations = ["Yekepa / Nimba Mining Concession", "Buchanan Hub", "Gbarnga / Bong County", "Monrovia Central"];
const acceptedFiles = ".pdf,.xlsx,.xls,.csv,.dwg,.doc,.docx,.zip";
const maxFileSize = 25 * 1024 * 1024;
const filterOptions = ["All Categories", "Heavy Site", "Mechanical & Power"];
const categoryOptions = categories.map((category) => category.title);

function scrollToRequest() {
  document.getElementById("procurement-request")?.scrollIntoView({ behavior: "smooth" });
}

function ProcurementPage() {
  const [filter, setFilter] = useState("All Categories");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [origin, setOrigin] = useState("Monrovia");
  const [destination, setDestination] = useState(destinations[0]);
  const submissionLock = useRef(false);

  const shownCategories = categories.filter((category) => filter === "All Categories" || category.group === filter);
  const transitTime = routes[destination][origin];

  function chooseFile(file) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "xlsx", "xls", "csv", "dwg", "doc", "docx", "zip"].includes(extension)) {
      setSelectedFile(null);
      setFormError("Choose a PDF, Excel, CSV, DWG, Word or ZIP document.");
      return;
    }
    if (file.size > maxFileSize) {
      setSelectedFile(null);
      setFormError("The selected document is larger than 25 MB. Choose a smaller file.");
      return;
    }
    setFormError("");
    setSelectedFile(file);
  }

  function selectCategory(title) {
    setSelectedCategory(title);
    scrollToRequest();
  }

  async function submitEnquiry(event) {
    event.preventDefault();
    if (submissionLock.current) return;
    submissionLock.current = true;
    setIsSubmitting(true);
    const form = event.currentTarget;
    if (selectedFile && selectedFile.size > maxFileSize) {
      setFormError("The selected document is larger than 25 MB. Choose a smaller file.");
      submissionLock.current = false;
      setIsSubmitting(false);
      return;
    }
    const formData = new FormData(form);
    formData.delete("attachment");
    const fields = Object.fromEntries(formData.entries());

    try {
      const savedRequestId = await submitProcurementRequest(fields);
      setRequestId(savedRequestId);
      if (selectedFile) {
        try {
          await uploadRequestAttachment(savedRequestId, selectedFile);
          setAttachmentError("");
        } catch (uploadError) {
          setAttachmentError(`Your inquiry was received, but the BOQ upload failed. ${getSubmissionErrorMessage(uploadError, "Please retry the upload.")}`);
        }
      }
      form.reset();
      setSelectedCategory("");
      setFormError("");
      setSubmitted(true);
    } catch (error) {
      console.error("Could not save procurement enquiry.", error);
      setFormError(getSubmissionErrorMessage(error, "We couldn't save your request. Please try again."));
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  async function retryAttachmentUpload() {
    if (!requestId || !selectedFile || submissionLock.current) return;
    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      await uploadRequestAttachment(requestId, selectedFile);
      setAttachmentError("");
    } catch (error) {
      setAttachmentError(`The BOQ upload failed. ${getSubmissionErrorMessage(error, "Please retry the upload.")}`);
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  function downloadSupplierGuidelines() {
    const content = [
      "EquipLink Supplier Guidelines",
      "",
      "To introduce your company for procurement opportunities in Liberia, prepare:",
      "- Company profile and registration documents",
      "- Product catalogue, technical data sheets and OEM authorization (where applicable)",
      "- Quality certificates and references for comparable supply",
      "- Export capability, country of origin and typical lead times",
      "- Indicative pricing, currency, Incoterms and payment terms",
      "- Warranty, after-sales support and logistics capabilities",
      "",
      `Submit your supplier profile to ${companyContact.email}. Supplier review and any tender award are subject to verification and project-specific requirements.`,
    ].join("\n");
    const link = document.createElement("a");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    link.href = url;
    link.download = "equiplink-supplier-guidelines.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <MainLayout>
      <div className="procurement-page">
        <div className="procurement-utility">
          <a href={companyContact.phones[0].href}><Phone size={12} /> {companyContact.phones[0].label}</a>
          <span><MapPin size={12} /> {companyContact.address} · Mon–Sat: 08:00–18:00 GMT</span>
          <span className="procurement-dispatch"><i /> DISPATCH OPERATIONAL</span>
        </div>

        <section className="procurement-hero">
          <div className="procurement-hero-copy">
            <p className="procurement-kicker"><i /> INDUSTRIAL SUPPLY CHAIN DIVISION · WEST AFRICA</p>
            <h1>Reliable Industrial Procurement &amp; <em>Supply Across Liberia.</em></h1>
            <p className="procurement-hero-description">From bulk construction aggregate and certified rebar to OEM machinery spares and high-capacity generator units. We bridge vetted global manufacturers directly to mining concessions, municipal contractors and commercial infrastructure hubs.</p>
            <div className="procurement-hero-actions">
              <button type="button" className="procurement-button procurement-button-amber" onClick={scrollToRequest}>Submit Procurement Request (RFQ) <ArrowRight size={16} /></button>
              <a className="procurement-button procurement-button-outline" href="#sourcing-divisions">Explore Supply Divisions <ArrowUpRight size={15} /></a>
            </div>
            <div className="procurement-trust-pills">
              <span><Container size={14} /> Freeport of Monrovia port handling</span>
              <span><Truck size={14} /> Inland haulage to Nimba &amp; Buchanan</span>
              <span><FileCheck2 size={14} /> BOQ documentation support</span>
            </div>
          </div>
          <aside className="procurement-hero-visual">
            <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=85" alt="Cargo containers at a commercial seaport" />
            <div className="procurement-hero-visual-shade" />
            <div className="procurement-clearing-label"><i /> LIBERIA INLAND CLEARING READY</div>
            <div className="procurement-telemetry">
              <span><strong>$18M+</strong><small>SOURCED VOLUME*</small></span>
              <span><strong>120+</strong><small>TIER-1 SUPPLIERS*</small></span>
              <span><strong>15</strong><small>COUNTIES COVERED*</small></span>
            </div>
            <p><ShieldCheck size={15} /> Quality, certificates and export documentation coordinated per order.</p>
          </aside>
        </section>

        <section className="procurement-status-strip" aria-label="Corridor status updates">
          <span className="procurement-status-title"><Radio size={15} /> CORRIDOR UPDATES</span>
          <span><i /> Freeport Terminal Berth 03: clearance coordination</span>
          <span><i /> Monrovia–Buchanan haulage corridor: operational</span>
          <span><i /> Nimba highway: heavy convoy route planning</span>
        </section>
        <p className="procurement-metrics-note">*Figures and corridor updates are indicative page content and should be confirmed with EquipLink before publication or use for shipment planning.</p>

        <section className="procurement-divisions" id="sourcing-divisions">
          <div className="procurement-section-heading">
            <div><p className="procurement-eyebrow"><span>01</span> INVENTORY &amp; PROCURED COMMODITIES</p><h2>Core sourcing <em>divisions.</em></h2><p>Institutional procurement channels for infrastructure projects, industrial operations and commercial facilities throughout Liberia.</p></div>
            <div className="procurement-filter-tabs" role="group" aria-label="Filter supply divisions">
              {filterOptions.map((option) => <button key={option} type="button" className={filter === option ? "active" : ""} aria-pressed={filter === option} onClick={() => setFilter(option)}>{option}</button>)}
            </div>
          </div>
          <div className="procurement-card-grid">
            {shownCategories.map((category) => {
              const Icon = category.icon;
              return <article className="procurement-card" key={category.number}>
                <div className="procurement-card-image"><img src={category.image} alt="" loading="lazy" /><span>{category.badge}</span><small>DIVISION {category.number}</small></div>
                <div className="procurement-card-body">
                  <div className="procurement-card-title"><Icon size={17} /><h3>{category.title}</h3></div>
                  <p>{category.description}</p>
                  <ul>{category.items.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul>
                  <div className="procurement-card-bottom"><span><Clock3 size={13} /> {category.leadTime}</span><button type="button" onClick={() => selectCategory(category.title)}>Select category <ArrowRight size={13} /></button></div>
                </div>
              </article>;
            })}
          </div>
        </section>

        <section className="procurement-pipeline">
          <div className="procurement-pipeline-heading"><p className="procurement-eyebrow"><span>02</span> RIGOROUS EXECUTION PROTOCOL</p><h2>Our 4-stage sourcing <em>pipeline.</em></h2><p>A transparent, auditable workflow designed to reduce counterfeit risk, cost uncertainty and customs delays.</p></div>
          <div className="procurement-pipeline-grid">{pipeline.map(([number, title, description]) => <article key={number}><span>{number}</span><div className="procurement-pipeline-line" /><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>

        <section className="procurement-request" id="procurement-request">
          <div className="procurement-request-copy">
            <p className="procurement-eyebrow"><span>03</span> FORMAL REQUISITION DESK</p>
            <h2>Submit a procurement <em>request.</em></h2>
            <p>Share your BOQ, requested quantity and destination. Our team can review specifications and prepare a quotation for your supply requirements.</p>
            <ul>
              <li><UserRound size={16} /><span><strong>Dedicated officer assigned</strong><small>One point of contact from quotation through delivery coordination.</small></span></li>
              <li><FileCheck2 size={16} /><span><strong>USD &amp; LRD invoicing</strong><small>Quote and tax documentation details confirmed per request.</small></span></li>
              <li><PackageCheck size={16} /><span><strong>Clear logistics breakdown</strong><small>Confirm applicable duties, handling and delivery costs before proceeding.</small></span></li>
            </ul>
            <div className="procurement-contact-card">
              <Headphones size={18} /><div><small>DIRECT PROCUREMENT HOTLINE</small>{companyContact.phones.map((phone) => <a key={phone.href} href={phone.href}>{phone.label}</a>)}<a href={companyContact.emailHref}>{companyContact.email}</a><a href={companyContact.websiteHref}>{companyContact.website}</a><span>{companyContact.address}</span></div>
            </div>
            <p className="procurement-file-formats"><FileText size={14} /> BOQ formats: PDF · XLSX · CSV · DWG</p>
          </div>

          <form className="procurement-form" onSubmit={submitEnquiry}>
            <div className="procurement-form-heading"><div><h3>Bill of Quantities (BOQ) &amp; Supply Inquiry</h3><p>Fields marked * are required.</p></div><span><LockKeyhole size={13} /> PRIVATE INTAKE</span></div>
            {formError && <p className="procurement-error" role="alert">{formError}</p>}
            {submitted ? <div className="procurement-success" role="status"><CheckCircle2 size={27} /><h3>Request received</h3><p>Your request reference is {requestId}. Our team will follow up using the details provided.</p>{attachmentError && <p className="procurement-error" role="alert">{attachmentError}</p>}{attachmentError && selectedFile && <button type="button" disabled={isSubmitting} onClick={retryAttachmentUpload}>{isSubmitting ? "Uploading..." : "Retry BOQ upload"}</button>}<button type="button" onClick={() => { setSubmitted(false); setSelectedFile(null); }}>Submit another request</button></div> : <>
              <div className="procurement-form-grid">
                <label>Requesting entity / company name *<input name="company" required placeholder="Registered company name" /></label>
                <label>Procurement officer / contact name *<input name="name" required placeholder="Full name and title" /></label>
                <label>Corporate email address *<input name="email" type="email" required placeholder="name@company.com" /></label>
                <label>Direct phone / WhatsApp *<input name="phone" type="tel" required placeholder="+231 ..." /></label>
                <label>Primary procurement category *<select name="division" required value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}><option value="" disabled>Select a division</option>{categoryOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label>Target fulfillment timeline *<select name="timeline" required defaultValue=""><option value="" disabled>Select timeline</option><option>Emergency urgent</option><option>1–2 weeks</option><option>30 days</option><option>Recurring monthly supply</option></select></label>
                <label>Estimated quantity &amp; units *<input name="quantity" required placeholder="500 metric tons / 2 × 40ft containers" /></label>
                <label>Delivery destination in Liberia *<select name="destination" required defaultValue=""><option value="" disabled>Select destination</option>{["Freeport Terminal", "Monrovia Central", "Buchanan Hub", "Nimba Corridor", "Custom Site"].map((option) => <option key={option}>{option}</option>)}</select></label>
                <label className="procurement-form-wide">Product specifications &amp; OEM part numbers *<textarea name="details" required rows="4" placeholder="Include serial codes, grade specifications, ASTM/DIN standards and other technical requirements." /></label>
                <div className={`procurement-dropzone${dragging ? " is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files?.[0]); }}>
                  <input id="procurement-attachment" name="attachment" type="file" accept={acceptedFiles} disabled={isSubmitting} onChange={(event) => chooseFile(event.target.files?.[0])} />
                  <label htmlFor="procurement-attachment"><FileText size={19} /><strong>{selectedFile ? selectedFile.name : "Click to select a BOQ sheet, or drag & drop here"}</strong><small>PDF, Excel, CSV, DWG, Word or ZIP · max 25 MB</small></label>
                  {selectedFile && <button type="button" aria-label="Remove selected file" onClick={() => setSelectedFile(null)}>Remove</button>}
                </div>
                <label className="procurement-consent"><input type="checkbox" name="authorized" required /><span>I confirm this inquiry is from an authorized entity and authorize EquipLink to prepare a quotation with an associated logistics breakdown.</span></label>
              </div>
              <p className="procurement-upload-note">BOQ documents are stored privately and associated with this request.</p>
              <button className="procurement-button procurement-button-amber procurement-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? "Submitting..." : "Request Competitive Quotation"} <ArrowRight size={15} /></button>
              <p className="procurement-privacy"><ShieldCheck size={14} /> Your request details are used to respond to this inquiry.</p>
            </>}
          </form>
        </section>

        <section className="procurement-estimator">
          <div className="procurement-estimator-copy"><p className="procurement-eyebrow"><span>04</span> INLAND LOGISTICS PLANNING</p><h2>Liberia transit time <em>estimator.</em></h2><p>Indicative road transit estimates from logistics hubs to project corridors. Actual schedules depend on weather, road conditions, customs and convoy requirements.</p>
            <div className="procurement-estimator-controls">
              <label>Origin hub<select value={origin} onChange={(event) => setOrigin(event.target.value)}><option value="Monrovia">Freeport of Monrovia (Bonded)</option><option value="Buchanan">Buchanan Hub</option><option value="Robertsport">Robertsport corridor</option></select></label>
              <label>Destination site<select value={destination} onChange={(event) => setDestination(event.target.value)}>{destinations.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <div className="procurement-estimate-result"><span><Clock3 size={16} /> ESTIMATED ROAD TRANSIT · HEAVY CONVOY</span><strong>{transitTime}</strong><small>{origin === "Monrovia" ? "Freeport of Monrovia" : origin} → {destination}</small></div>
            <div className="procurement-estimator-notes"><span><CheckCircle2 size={15} /> Clearance timing confirmed per shipment</span><span><Radio size={15} /> GPS fleet telemetry and escort options subject to availability</span></div>
          </div>
          <div className="procurement-route-map" aria-label={`Illustrative route from ${origin} to ${destination}`}>
            <div className="procurement-map-grid" /><div className="procurement-map-road procurement-road-one" /><div className="procurement-map-road procurement-road-two" /><div className="procurement-map-route"><i /><span /><b /></div>
            <span className="procurement-map-label procurement-map-label-a">MONROVIA</span><span className="procurement-map-label procurement-map-label-b">BUCHANAN</span><span className="procurement-map-label procurement-map-label-c">NIMBA</span>
            <div className="procurement-map-marker"><MapPin size={19} /></div><div className="procurement-map-card"><span><i /> ROUTE PLANNING</span><strong>{destination}</strong><small>LIBERIA · ESTIMATE ONLY</small></div>
          </div>
        </section>

        <section className="procurement-partner">
          <div><p className="procurement-eyebrow"><span>05</span> SUPPLIER NETWORK</p><h2>Are you an accredited manufacturer or <em>wholesaler?</em></h2><p>Introduce your company for consideration on infrastructure and industrial supply opportunities. Supplier verification and project terms are agreed before any order is placed.</p>
            <div className="procurement-partner-pillars"><span><ShieldCheck size={15} /> Escrow-protected terms by agreement</span><span><Container size={15} /> Port warehousing options</span><span><FileCheck2 size={15} /> Corporate tender coordination</span></div>
            <div className="procurement-partner-actions"><a className="procurement-button procurement-button-amber" href={`${companyContact.emailHref}?subject=Verified%20Supplier%20Application`}>Apply as Verified Supplier <ArrowRight size={15} /></a><button type="button" className="procurement-button procurement-button-outline" onClick={downloadSupplierGuidelines}><ArrowDownToLine size={15} /> Download Supplier Guidelines</button></div>
          </div>
          <div className="procurement-partner-stamp"><BadgeCheck size={25} /><strong>Supplier<br />verification</strong><small>PROJECT-BY-PROJECT REVIEW</small></div>
        </section>

        <section className="procurement-brand-strip" aria-label="Brands and manufacturers commonly specified">
          <p>COMMONLY SPECIFIED MANUFACTURERS &amp; BRANDS · NOT AN ENDORSEMENT</p>
          <div>{["Caterpillar", "Volvo CE", "Komatsu", "Cummins", "Schneider", "TotalEnergies", "JCB"].map((brand) => <span key={brand}>{brand}</span>)}</div>
        </section>
      </div>
    </MainLayout>
  );
}

export default ProcurementPage;

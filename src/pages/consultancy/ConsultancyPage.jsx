import { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  LockKeyhole,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { MainLayout } from "../../components/layout/MainLayout.jsx";
import { companyContact } from "../../data/company.js";
import {
  getSubmissionErrorMessage,
  submitConsultancyRequest,
  uploadRequestAttachment,
} from "../../utils/supabaseRequests.js";
import "./consultancy.css";

const practices = [
  {
    number: "01",
    title: "Work Permit Assistance",
    badge: "CLASS A & B",
    description: "Full-cycle administration for expatriate executive quotas, heavy machinery operators and civil engineering directors.",
    deliverables: ["Class A (Executive) & Class B (Technical) filings", "Expatriate quota authorization petitions", "Ministry of Labour clearance certificates", "Annual renewal alerts & fast-track audits"],
    
    action: "Request permit",
  },
  {
    number: "02",
    title: "Residence Permit Assistance",
    badge: "LIS REGISTRATION",
    description: "Navigate Liberia Immigration Service biometric enrollment with dedicated officer accompaniment.",
    deliverables: ["LIS biometric capture scheduling & escort", "Alien Registration Card issuance & delivery", "Spouse & dependent residency packages", "Re-entry permit management for rotational staff"],
    
    action: "Request permit",
  },
  {
    number: "03",
    title: "Visa-on-Arrival (VoA)",
    badge: "ROB PROTOCOL",
    description: "Rapid pre-clearance letters and airport arrival protocol for incoming specialists and senior delegations.",
    deliverables: ["LIS-endorsed pre-entry approval authority letter", "Roberts International Airport meet & greet", "Corporate guarantee letters & vetting", "Emergency same-day dispatch available"],
   
    action: "Apply for VoA",
  },
  {
    number: "04",
    title: "Business Registration & Tax Filings",
    badge: "LBR & LRA",
    description: "End-to-end statutory formation of Liberian corporations, branches, LLCs and specialized joint ventures.",
    deliverables: ["Liberia Business Registry Articles filing", "Tax Identification Number from the LRA", "NASSCORP & Social Security registration", "Commercial bank account introduction"],
  
    action: "Start incorporation",
  },
  {
    number: "05",
    title: "Document Legalization & Notary",
    badge: "MFA & NOTARY",
    description: "Official notarization and diplomatic legalization for international contracts, powers of attorney and credentials.",
    deliverables: ["Ministry of Foreign Affairs authentication", "Certified French, Chinese & Arabic translations", "Notary Public attestation & sealing", "Apostille coordination for foreign jurisdictions"],

    action: "Legalize documents",
  },
  {
    number: "06",
    title: "Ministry Liaison & Desk Retainers",
    badge: "DEDICATED OFFICER",
    description: "Persistent in-person follow-up across the Ministry of Mines & Energy, Ministry of Commerce and NIC.",
    deliverables: ["Dedicated on-ground corporate liaison officers", "Weekly docket progression reports", "EPA & sectoral operating permit facilitation", "Regulatory dispute & audit defense coordination"],
    timeline: "Retainer / Continuous",
    action: "Retain officer",
  },
];

const roadmap = [
  ["01", "Case assessment", "Review corporate structure, expatriate quotas and work contracts to define the right visa and statutory pathway.", "DAY 1 · CONFIDENTIAL BRIEF"],
  ["02", "Compilation & vetting", "Pre-audit biometric scans, police records, medicals and tax filings; prepare the ministry legal memorandum.", "DAY 2–3 · LEGAL VERIFICATION"],
  ["03", "Statutory lodgement", "Assigned liaison officers lodge applications across LIS, Ministry of Labour or Roberts International Airport.", "DAY 4–8 · ACTIVE LIAISON"],
  ["04", "Clearance handover", "Deliver issued permits and registered articles, then archive each case in the renewal tracker.", "FINAL · SECURED DELIVERY"],
];

const proofPoints = [
  ["LOCAL CONTENT ALIGNMENT", "Structure apprentice ratios to meet Ministry of Labour requirements and reduce expatriate quota risk."],
  ["TAX CLEARANCE & TIN SETUP", "Coordinate LRA registration so invoicing, duty exemptions and machinery imports can proceed."],
  ["AIRPORT VIP RECEPTION", "Arrange dedicated gate support for arriving personnel and direct them to the appropriate immigration desk."],
];

const testimonials = [
  {
    quote: "Our crane specialists were deployed through Freeport with Class B permits and Alien Cards in under nine business days. The coordination was exceptional.",
    name: "Erik K. Lindqvist",
    role: "Operations Director · Nordic Marine Infra",
    initials: "EL",
  },
  {
    quote: "EquipLink organized our incorporation, LBR Articles, Tax ID and social security registrations in one clear, well-managed docket.",
    name: "Thurman Myers",
    role: "General Counsel · Nimba Resources LLC",
    initials: "TM",
  },
  {
    quote: "Our emergency bridge inspection delegation had its VoA letters ready before boarding in Brussels. That response kept a critical project on schedule.",
    name: "Claire Dubois",
    role: "West Africa Lead · Global Relief Logistics",
    initials: "CD",
  },
];

const locations = [
  ["MINISTRY OF LABOUR (MOL) DESK", "Tubman Boulevard, Congo Town, Monrovia", "LABOUR & WORK PERMITS"],
  ["LIBERIA IMMIGRATION SERVICE (LIS) HQ", "Broad Street & Mamba Point liaison channel", "IMMIGRATION & RESIDENCY"],
  ["ROB PROTOCOL STATION", "Roberts International Airport, Margibi County", "ARRIVAL & CLEARANCE"],
];

const serviceOptions = [
  "Work Permits Class A/B",
  "Residence Permit / Alien Card",
  "Visa on Arrival",
  "Corporation Registration",
  "Document Legalization",
  "Ministry Desk Retainer",
];

const acceptedFiles = ".pdf,.doc,.docx,.zip";
const maxFileSize = 25 * 1024 * 1024;

function scrollToIntake() {
  document.getElementById("consultancy-intake")?.scrollIntoView({ behavior: "smooth" });
}

function ConsultancyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [requestId, setRequestId] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const submissionLock = useRef(false);

  async function submitEnquiry(event) {
    event.preventDefault();
    if (submissionLock.current) return;
    submissionLock.current = true;
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("attachment");

    if (file instanceof File && file.size > maxFileSize) {
      setFormError("The selected document is larger than 25 MB. Choose a smaller file.");
      submissionLock.current = false;
      setIsSubmitting(false);
      return;
    }

    formData.delete("attachment");
    const fields = Object.fromEntries(formData.entries());

    try {
      const savedRequestId = await submitConsultancyRequest(fields);
      setRequestId(savedRequestId);
      const hasFile = file instanceof File && file.size > 0;
      setSelectedFile(hasFile ? file : null);
      if (hasFile) {
        try {
          await uploadRequestAttachment(savedRequestId, file);
          setAttachmentError("");
        } catch (uploadError) {
          setAttachmentError(`Your enquiry was received, but the document upload failed. ${getSubmissionErrorMessage(uploadError, "Please retry the upload.")}`);
        }
      }
      form.reset();
      setFormError("");
      setSubmitted(true);
    } catch (error) {
      console.error("Could not save consultancy enquiry.", error);
      setFormError(getSubmissionErrorMessage(error, "We couldn't save your enquiry. Please try again."));
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
      setAttachmentError(`The document upload failed. ${getSubmissionErrorMessage(error, "Please retry the upload.")}`);
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <MainLayout>
      <div className="consultancy-page">
        <section className="consultancy-hero">
          <div className="consultancy-hero-copy">
            <p className="consultancy-accreditation"><i /> MINISTRY OF LABOUR &amp; IMMIGRATION ACCREDITED</p>
            <h1>Executive Business Consultancy &amp; <em>Regulatory Mobility</em> in Liberia</h1>
            <p className="consultancy-hero-description">
              Navigating statutory compliance, corporate immigration, and local business establishment with unmatched local expertise and transparent timelines. Engineered for engineering firms, concessionaires, mining operators, and multinational partners.
            </p>
            <div className="consultancy-hero-actions">
              <button type="button" className="consultancy-button consultancy-button-amber" onClick={scrollToIntake}>Retain dedicated liaison <ArrowRight size={16} /></button>
              <a className="consultancy-button consultancy-button-outline" href="#core-practices">Explore 6 core practices <ArrowUpRight size={15} /></a>
            </div>
            <div className="consultancy-trust-stats">
              <div><ShieldCheck size={17} /><span><strong>100%</strong><small>STATUTORY COMPLIANCE</small></span></div>
              <div><FileCheck2 size={17} /><span><strong>450+</strong><small>PERMITS HANDLED</small></span></div>
              <div><Clock3 size={17} /><span><strong>24–48h</strong><small>FAST-TRACK VOA</small></span></div>
            </div>
          </div>

          <aside className="consultancy-field-unit" aria-label="Monrovia liaison desk operations">
            <div className="consultancy-field-photo">
              <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85" alt="Consultants reviewing documents at a desk" />
              <div><span><i /> OPERATIONAL FIELD UNIT</span><strong>Monrovia Liaison Desk</strong></div>
            </div>
            <div className="consultancy-telemetry">
              <div className="consultancy-telemetry-heading"><Building2 size={16} /><span>REGULATORY TELEMETRY</span><small><i /> LIVE</small></div>
              <div><span>Ministry of Labour (Class A/B)</span><strong>Live slot</strong></div>
              <div><span>Liberia Immigration Service (LIS)</span><strong>Direct intake</strong></div>
              <div><span>ROB clearance</span><strong>24/7 gate dispatch</strong></div>
            </div>
            <p className="consultancy-cert-note"><BadgeCheck size={16} /> Corporate representation is undertaken under client mandate and applicable Liberian law.</p>
          </aside>
        </section>

        <section className="consultancy-track-record" aria-label="Track record">
          <div><strong>99.4<span>%</span></strong><small>FIRST-SUBMISSION<br />APPROVAL RATE</small></div>
          <div><strong>72 <span>hrs</span></strong><small>AVERAGE VOA<br />CLEARANCE WINDOW</small></div>
          <div><strong>85<span>+</span></strong><small>CORPORATE ENTITIES<br />INCORPORATED</small></div>
          <div><strong>100<span>%</span></strong><small>LRA &amp; MOL<br />AUDIT READY</small></div>
        </section>

        <section className="consultancy-practices" id="core-practices">
          <div className="consultancy-section-heading">
            <div><p className="consultancy-eyebrow"><span>01</span> SPECIALIZED ADVISORY PILLARS</p><h2>Core practice <em>areas.</em></h2><p>Engineered compliance protocols to minimize project delays, safeguard expatriate legalities and maintain regulatory standing.</p></div>
            <span className="consultancy-ministry-badge"><Building2 size={15} /> DIRECT MINISTRY REPRESENTATION AVAILABLE</span>
          </div>
          <div className="consultancy-practice-grid">
            {practices.map((practice) => (
              <article className="consultancy-practice-card" key={practice.number}>
                <div className="consultancy-practice-top"><span>{practice.number}</span><small>{practice.badge}</small></div>
                <h3>{practice.title}</h3>
                <p>{practice.description}</p>
                <ul>{practice.deliverables.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul>
                <div className="consultancy-practice-bottom"><span><Clock3 size={13} /> {practice.timeline}</span><button type="button" onClick={scrollToIntake}>{practice.action} <ArrowRight size={14} /></button></div>
              </article>
            ))}
          </div>
        </section>

        <section className="consultancy-roadmap">
          <div className="consultancy-roadmap-heading"><p className="consultancy-eyebrow"><span>02</span> OPERATIONAL EXECUTION MODEL</p><h2>How EquipLink navigates <em>your clearances.</em></h2><p>A disciplined four-phase workflow for documented submissions, accountable follow-up and a clear handover.</p></div>
          <div className="consultancy-roadmap-grid">{roadmap.map(([number, title, description, milestone]) => <article key={number}><span className="consultancy-roadmap-number">{number}</span><div className="consultancy-roadmap-line" /><h3>{title}</h3><p>{description}</p><small>{milestone}</small></article>)}</div>
        </section>

        <section className="consultancy-integration">
          <div className="consultancy-gallery" aria-label="Compliance and project coordination gallery">
            <img className="consultancy-gallery-large" src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=85" alt="Formal compliance documents being reviewed" />
            <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=85" alt="Professional business meeting room" />
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=85" alt="Project team collaborating on a dossier" />
            <span><i /> LOCAL LIAISON · MONROVIA</span>
          </div>
          <div className="consultancy-integration-copy"><p className="consultancy-eyebrow">03 · REGULATORY MASTERY</p><h2>Integrated mobility for mining, forestry &amp; <em>civil engineering.</em></h2><p>Operating heavy equipment and contracting teams in West Africa requires alignment between immigration law and labor requirements. EquipLink connects equipment sourcing with legal onboarding, helping specialized operators, engineers and executives prepare to deploy in Liberia.</p>
            <div className="consultancy-proof-list">{proofPoints.map(([title, detail], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{detail}</p></div><CheckCircle2 size={16} /></article>)}</div>
          </div>
        </section>

        <section className="consultancy-testimonials">
          <div className="consultancy-section-heading"><div><p className="consultancy-eyebrow"><span>04</span> CORPORATE REFERENCES</p><h2>Trusted by concessionaires &amp; <em>contractors.</em></h2><p>Experiences shared by business leaders working across Liberia.</p></div></div>
          <div className="consultancy-testimonial-grid">{testimonials.map((item) => <blockquote key={item.name}><div className="consultancy-quote-mark">“</div><p>{item.quote}</p><footer><span>{item.initials}</span><div><strong>{item.name}</strong><small>{item.role}</small></div><BadgeCheck size={16} /></footer></blockquote>)}</div>
        </section>

        <section className="consultancy-intake" id="consultancy-intake">
          <div className="consultancy-intake-copy"><p className="consultancy-eyebrow"><span>05</span> MANDATE INTAKE DESK</p><h2>Schedule a consultation or <em>request permit support.</em></h2><p>Provide details regarding your organization, incoming personnel or business registration needs. An EquipLink compliance officer will review your enquiry and respond within four business hours.</p>
            <ul><li><UserRound size={15} /><span><strong>Dedicated officer assigned</strong><small>A local point of contact for your case.</small></span></li><li><BadgeCheck size={15} /><span><strong>Clear invoicing</strong><small>USD &amp; LRD options, with applicable documentation.</small></span></li><li><LockKeyhole size={15} /><span><strong>Confidential case handling</strong><small>Submitted information is used to follow up on your enquiry.</small></span></li></ul>
            <div className="consultancy-intake-contact"><Phone size={16} /><span><small>URGENT CASE? CALL EQUIPLINK</small><a href={companyContact.phones[0].href}>{companyContact.phones[0].label}</a></span></div>
          </div>
          <form className="consultancy-form" onSubmit={submitEnquiry}>
            <div className="consultancy-form-heading"><div><h3>Consultancy &amp; permit enquiry</h3><p>Fields marked * are required.</p></div><span><i /> SECURE INTAKE</span></div>
            {formError && <p className="consultancy-form-error" role="alert">{formError}</p>}
            {submitted ? <div className="consultancy-form-success" role="status"><CheckCircle2 size={26} /><h3>Enquiry submitted</h3><p>Your request reference is {requestId}. Our team will follow up using the contact details provided.</p>{attachmentError && <p className="consultancy-form-error" role="alert">{attachmentError}</p>}{attachmentError && selectedFile && <button type="button" disabled={isSubmitting} onClick={retryAttachmentUpload}>{isSubmitting ? "Uploading..." : "Retry document upload"}</button>}<button type="button" onClick={() => setSubmitted(false)}>Submit another enquiry</button></div> : <>
              <div className="consultancy-form-grid">
                <label>Organization / company name *<input name="company" required placeholder="Registered company name" /></label>
                <label>Contact person &amp; title *<input name="name" required placeholder="Full name and role" /></label>
                <label>Corporate email address *<input type="email" name="email" required placeholder="name@company.com" /></label>
                <label>Phone / WhatsApp number *<input type="tel" name="phone" required placeholder="+231 ..." /></label>
                <label>Service category *<select name="practice" required defaultValue=""><option value="" disabled>Select a service</option>{serviceOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label>Personnel count<select name="headcount" defaultValue=""><option value="">Select headcount</option><option>1</option><option>2-5</option><option>6-15</option><option>16+</option></select></label>
                <label>Urgency level<select name="urgency" defaultValue="Standard · 5-10 days"><option>Standard · 5-10 days</option><option>Expedited · 3-5 days</option><option>Emergency · 24-48 hours</option></select></label>
                <label className="consultancy-form-wide">Specific objectives &amp; case notes<textarea name="details" rows="4" placeholder="Project timeline, nationality mix, equipment link or registration targets" /></label>
                <label className="consultancy-upload consultancy-form-wide"><FileText size={19} /><strong>Supporting credentials &amp; documents <span>(optional)</span></strong><small>PDF, DOC, DOCX or ZIP · Maximum 25 MB</small><input type="file" name="attachment" accept={acceptedFiles} disabled={isSubmitting} onChange={(event) => {
                  const file = event.target.files?.[0];
                  setSelectedFile(file || null);
                  if (file && file.size > maxFileSize) setFormError("The selected document is larger than 25 MB. Choose a smaller file.");
                  else setFormError("");
                }} /><small>Documents are stored privately and associated with this request.</small></label>
              </div>
              <button className="consultancy-button consultancy-button-amber consultancy-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit consultancy enquiry"} <ArrowRight size={15} /></button>
              <p className="consultancy-form-privacy"><ShieldCheck size={14} /> By submitting, you authorize EquipLink to contact you about this enquiry.</p>
            </>}
          </form>
        </section>

        <section className="consultancy-locations">
          <div className="consultancy-section-heading"><div><p className="consultancy-eyebrow"><span>06</span> MINISTERIAL EPICENTERS</p><h2>Direct access to Monrovia&apos;s <em>regulatory epicenters.</em></h2><p>Our liaison team coordinates with ministry desks, immigration officers and airport protocol teams across the Monrovia corridor.</p></div></div>
          <div className="consultancy-location-grid">{locations.map(([title, address, service]) => <article key={title}><span className="consultancy-location-icon"><MapPin size={17} /></span><small>{service}</small><h3>{title}</h3><p>{address}</p><span className="consultancy-location-status"><i /> LIAISON CHANNEL</span></article>)}</div>
          <div className="consultancy-map"><div className="consultancy-map-grid" /><div className="consultancy-map-road consultancy-map-road-one" /><div className="consultancy-map-road consultancy-map-road-two" /><div className="consultancy-map-road consultancy-map-road-three" /><span className="consultancy-map-label consultancy-map-label-one">TUBMAN BLVD</span><span className="consultancy-map-label consultancy-map-label-two">CONGO TOWN</span><span className="consultancy-map-label consultancy-map-label-three">MONROVIA</span><i className="consultancy-map-pin"><MapPin size={16} /></i><div className="consultancy-map-card"><span><i /> EQUIPLINK LIAISON CORRIDOR</span><strong>6.3156° N, 10.8074° W</strong><small>MONROVIA · LIBERIA</small></div></div>
        </section>

        <section className="consultancy-urgent"><div><p className="consultancy-eyebrow">URGENT REGULATORY SUPPORT</p><h2>Need urgent VoA or work authorization?</h2><p>Speak directly with an EquipLink consultant today.</p></div><a href={companyContact.phones[0].href}><Phone size={16} /> {companyContact.phones[0].label}</a><button type="button" className="consultancy-button consultancy-button-amber" onClick={scrollToIntake}>Request fast track <ArrowRight size={15} /></button></section>
      </div>
    </MainLayout>
  );
}

export default ConsultancyPage;

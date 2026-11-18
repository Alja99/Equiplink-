import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  fetchBookableEquipmentAssets,
  getSubmissionErrorMessage,
  submitEquipmentBooking,
  submitGeneralRequest,
} from "../../utils/supabaseRequests.js";

export default function ContactForm({ service = "Contact", equipmentName = "" }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(service === "Equipment");
  const submissionLock = useRef(false);
  const formAssets = equipmentName
    ? assets.filter((asset) => asset.name.toLowerCase() === equipmentName.toLowerCase())
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

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionLock.current) return;
    submissionLock.current = true;
    setIsSubmitting(true);
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());
    try {
      if (service === "Equipment") {
        await submitEquipmentBooking({
          ...fields,
          assetId: fields.assetId,
          startDateTime: fields.startDateTime,
          endDateTime: fields.endDateTime,
          deliveryLocation: fields.deliveryLocation,
          additionalRequirements: fields.details,
        });
      } else {
        await submitGeneralRequest({ service, ...fields });
      }
      form.reset();
      setError("");
      setSubmitted(true);
    } catch (saveError) {
      console.error("Could not submit the EquipLink enquiry.", saveError);
      setError(getSubmissionErrorMessage(saveError, "We couldn't save your request. Please try again."));
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className="app-form-panel" onSubmit={handleSubmit}>
      {submitted ? <p className="app-form-message" role="status">Thanks — your request has been added to the EquipLink operations queue.</p> : <>
        {error && <p className="app-form-error" role="alert">{error}</p>}
        <div className="app-form-grid">
          {service === "Equipment" && <>
            <label className="app-form-wide">Physical equipment asset
              <select name="assetId" required disabled={assetsLoading || assets.length === 0} defaultValue="">
                <option value="">{assetsLoading ? "Loading available assets..." : formAssets.length ? "Select an available asset" : equipmentName ? "No available assets for this model" : "No available assets"}</option>
                {formAssets.map((asset) => <option key={asset.asset_id} value={asset.asset_id}>
                  {asset.name}{asset.asset_code ? ` · ${asset.asset_code}` : ""} · {asset.location}
                </option>)}
              </select>
            </label>
            <label>Start date and time<input name="startDateTime" type="datetime-local" required /></label>
            <label>End date and time<input name="endDateTime" type="datetime-local" required /></label>
            <label className="app-form-wide">Delivery location<input name="deliveryLocation" required /></label>
          </>}
          <label>Name<input name="name" autoComplete="name" required /></label>
          <label>Work email<input type="email" name="email" autoComplete="email" required /></label>
          <label>Company<input name="company" autoComplete="organization" /></label>
          <label>Phone<input type="tel" name="phone" autoComplete="tel" /></label>
          <label className="app-form-wide">How can we help?<textarea name="details" rows="4" required /></label>
        </div>
        <button className="app-form-submit" type="submit" disabled={isSubmitting || (service === "Equipment" && (assetsLoading || formAssets.length === 0))} aria-busy={isSubmitting}>
          {isSubmitting ? "Submitting..." : service === "Equipment" ? "Send booking request" : "Send enquiry"} <ArrowRight size={15} />
        </button>
      </>}
    </form>
  );
}

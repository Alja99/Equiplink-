import { isSupabaseConfigured, supabase } from "../lib/supabase.js";

const DOCUMENT_BUCKET = "supporting-documents";
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Add the project URL and public anon key to your .env file.");
  }
  return supabase;
}

async function callRpc(name, args) {
  const client = requireSupabase();
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}

export function getSubmissionErrorMessage(error, fallback) {
  if (!isSupabaseConfigured) {
    return "Online requests are not configured yet. Please contact EquipLink directly.";
  }
  if (error?.code === "23P01") {
    return "That asset is unavailable for the selected period. Choose another asset or dates.";
  }
  if (error?.code === "23514") {
    return error.message || "Please check the required fields and try again.";
  }
  if (error?.message?.toLowerCase().includes("failed to fetch")) {
    return "We couldn't reach the request service. Check your connection and try again.";
  }
  return error?.message || fallback;
}

export async function fetchBookableEquipmentAssets() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("equipment_catalog")
    .select("asset_id, asset_code, name, category, location, daily_rate")
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export function submitGeneralRequest({ service, name, email, phone, company, details }) {
  return callRpc("submit_general_request", {
    p_request_type: service === "Partner" ? "partner" : "contact",
    p_customer_name: name,
    p_customer_email: email,
    p_customer_phone: phone || null,
    p_company_name: company || null,
    p_details: details,
  });
}

export function submitEquipmentBooking({
  name,
  email,
  phone,
  company,
  assetId,
  startDateTime,
  endDateTime,
  deliveryLocation,
  additionalRequirements,
}) {
  return callRpc("submit_equipment_booking", {
    p_customer_name: name,
    p_customer_email: email,
    p_customer_phone: phone || null,
    p_company_name: company || null,
    p_asset_id: assetId,
    p_start_local: startDateTime,
    p_end_local: endDateTime,
    p_delivery_location: deliveryLocation,
    p_additional_requirements: additionalRequirements || null,
  });
}

export function submitConsultancyRequest({
  name,
  email,
  phone,
  company,
  practice,
  headcount,
  urgency,
  targetDate,
  details,
}) {
  return callRpc("submit_consultancy_request", {
    p_customer_name: name,
    p_customer_email: email,
    p_customer_phone: phone || null,
    p_company_name: company || null,
    p_practice: practice,
    p_headcount: headcount || null,
    p_urgency: urgency || null,
    p_target_date: targetDate || null,
    p_details: details || null,
  });
}

export function submitProcurementRequest({
  name,
  email,
  phone,
  company,
  division,
  timeline,
  quantity,
  destination,
  partNumber,
  unit,
  details,
  authorized,
}) {
  return callRpc("submit_procurement_request", {
    p_customer_name: name,
    p_customer_email: email,
    p_customer_phone: phone || null,
    p_company_name: company || null,
    p_division: division,
    p_timeline: timeline,
    p_quantity: quantity,
    p_destination: destination,
    p_part_number: partNumber || null,
    p_unit: unit || null,
    p_details: details,
    p_authorized: authorized === "on" || authorized === true,
  });
}

function contentTypeFor(file) {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();
  const types = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    zip: "application/zip",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
    dwg: "application/acad",
  };
  return types[extension] || "application/octet-stream";
}

export async function uploadRequestAttachment(requestId, file) {
  const client = requireSupabase();
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_DOCUMENT_SIZE) throw new Error("The selected document is larger than 25 MB.");

  const fileName = file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-120) || "document";
  const objectPath = `${requestId}/${crypto.randomUUID()}-${fileName}`;
  const contentType = contentTypeFor(file);
  const storage = client.storage.from(DOCUMENT_BUCKET);
  const { error: uploadError } = await storage.upload(objectPath, file, {
    contentType,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { error: metadataError } = await client.rpc("record_request_attachment", {
    p_service_request_id: requestId,
    p_object_path: objectPath,
    p_original_name: file.name,
    p_content_type: contentType,
    p_size_bytes: file.size,
  });

  if (metadataError) {
    await storage.remove([objectPath]);
    throw metadataError;
  }

  return objectPath;
}

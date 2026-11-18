import { supabase } from "../lib/supabase.js";

const adminRequestSelect = `
  id, division, status, general_notes, created_at, updated_at,
  customer:customers!service_requests_customer_id_fkey(full_name, email, phone, company_name),
  booking:equipment_booking_requests!equipment_booking_requests_service_request_id_fkey(
    asset_id, starts_at, ends_at, delivery_location, additional_requirements, booking_status,
    asset:equipment_assets!equipment_booking_requests_asset_id_fkey(
      asset_code, location, equipment:equipment!equipment_assets_equipment_id_fkey(name, category, model)
    )
  ),
  consultancy:consultancy_request_details!consultancy_request_details_service_request_id_fkey(
    practice, headcount, urgency, target_date, details
  ),
  procurement:procurement_request_details!procurement_request_details_service_request_id_fkey(
    division, timeline, quantity, destination, part_number, unit, details
  ),
  general:general_request_details!general_request_details_service_request_id_fkey(request_type, details),
  attachments:request_attachments!request_attachments_service_request_id_fkey(
    id, object_path, original_name, content_type, size_bytes, created_at
  )
`;

export async function fetchAdminRequests() {
  const { data, error } = await supabase
    .from("service_requests")
    .select(adminRequestSelect)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAdminAssets() {
  const { data, error } = await supabase
    .from("equipment_assets")
    .select("id, asset_code, location, operational_status, availability_status, daily_rate, equipment:equipment(name, category, model)")
    .order("asset_code", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchAdminDowntime() {
  const { data, error } = await supabase
    .from("equipment_asset_downtime")
    .select("id, downtime_type, starts_at, ends_at, reason, downtime_status, asset:equipment_assets(asset_code, location, equipment:equipment(name))")
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateAdminRequestStatus(requestId, status) {
  const { error } = await supabase.rpc("update_service_request_status", {
    p_service_request_id: requestId,
    p_status: status,
  });
  if (error) throw error;
}

export async function createAttachmentDownloadUrl(objectPath) {
  const { data, error } = await supabase
    .storage
    .from("supporting-documents")
    .createSignedUrl(objectPath, 60);
  if (error) throw error;
  return data.signedUrl;
}

function one(value) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

const serviceLabels = {
  equipment: "Equipment",
  consultancy: "Consultancy",
  procurement: "Procurement",
  contact: "Contact",
  partner: "Partner",
};

const statusLabels = {
  pending: "Pending Review",
  in_review: "In Review",
  approved: "Approved",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  docs_verified: "Docs Verified",
  quote_prepared: "Quote Prepared",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export function normalizeAdminRequest(row) {
  const customer = one(row.customer) || {};
  const booking = one(row.booking);
  const asset = one(booking?.asset);
  const equipment = one(asset?.equipment);
  const consultancy = one(row.consultancy);
  const procurement = one(row.procurement);
  const general = one(row.general);
  const details = booking?.additional_requirements
    || consultancy?.details
    || procurement?.details
    || general?.details
    || row.general_notes
    || "";

  return {
    id: row.id,
    service: serviceLabels[row.division] || row.division,
    status: statusLabels[row.status] || row.status,
    statusValue: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: customer.full_name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    company: customer.company_name || "",
    item: equipment?.name || asset?.asset_code || procurement?.division || consultancy?.practice || general?.request_type || serviceLabels[row.division],
    location: booking?.delivery_location || asset?.location || procurement?.destination || "",
    details,
    booking,
    consultancy,
    procurement,
    attachments: row.attachments || [],
  };
}

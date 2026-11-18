CREATE TABLE public.general_request_details (
  service_request_id uuid PRIMARY KEY REFERENCES public.service_requests(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('contact', 'partner')),
  details text NOT NULL
);

CREATE TABLE public.consultancy_request_details (
  service_request_id uuid PRIMARY KEY REFERENCES public.service_requests(id) ON DELETE CASCADE,
  practice text NOT NULL,
  headcount text,
  urgency text,
  target_date date,
  details text
);

CREATE TABLE public.procurement_request_details (
  service_request_id uuid PRIMARY KEY REFERENCES public.service_requests(id) ON DELETE CASCADE,
  division text NOT NULL,
  timeline text NOT NULL,
  quantity text NOT NULL,
  destination text NOT NULL,
  part_number text,
  unit text,
  details text NOT NULL,
  authorized boolean NOT NULL CHECK (authorized)
);

CREATE TABLE public.request_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  bucket_id text NOT NULL DEFAULT 'supporting-documents',
  object_path text NOT NULL UNIQUE,
  original_name text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 26214400),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (bucket_id = 'supporting-documents'),
  CHECK (split_part(object_path, '/', 1) = service_request_id::text)
);

CREATE INDEX request_attachments_request_idx
  ON public.request_attachments (service_request_id, created_at);

ALTER TABLE public.general_request_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultancy_request_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_request_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY general_request_details_staff_read
  ON public.general_request_details FOR SELECT TO authenticated
  USING (public.is_equiplink_staff());

CREATE POLICY consultancy_request_details_staff_read
  ON public.consultancy_request_details FOR SELECT TO authenticated
  USING (public.is_equiplink_staff());

CREATE POLICY procurement_request_details_staff_read
  ON public.procurement_request_details FOR SELECT TO authenticated
  USING (public.is_equiplink_staff());

CREATE POLICY request_attachments_staff_read
  ON public.request_attachments FOR SELECT TO authenticated
  USING (public.is_equiplink_staff());

GRANT SELECT ON public.general_request_details,
  public.consultancy_request_details,
  public.procurement_request_details,
  public.request_attachments TO authenticated;

CREATE FUNCTION public.create_service_request(
  p_division text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_company_name text,
  p_general_notes text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  customer_id uuid;
  request_id uuid;
BEGIN
  IF nullif(btrim(p_customer_name), '') IS NULL
    OR nullif(btrim(p_customer_email), '') IS NULL
  THEN
    RAISE EXCEPTION 'Name and email are required.' USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.customers (full_name, email, phone, company_name)
  VALUES (
    btrim(p_customer_name),
    btrim(p_customer_email),
    nullif(btrim(p_customer_phone), ''),
    nullif(btrim(p_company_name), '')
  )
  ON CONFLICT ((lower(email))) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, public.customers.phone),
        company_name = COALESCE(EXCLUDED.company_name, public.customers.company_name),
        updated_at = now()
  RETURNING id INTO customer_id;

  INSERT INTO public.service_requests (customer_id, division, general_notes)
  VALUES (customer_id, p_division, nullif(btrim(p_general_notes), ''))
  RETURNING id INTO request_id;

  RETURN request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_service_request(text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.submit_general_request(
  p_request_type text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_company_name text,
  p_details text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  request_id uuid;
BEGIN
  IF p_request_type NOT IN ('contact', 'partner') OR nullif(btrim(p_details), '') IS NULL THEN
    RAISE EXCEPTION 'Choose a request type and provide details.' USING ERRCODE = '23514';
  END IF;

  request_id := public.create_service_request(
    p_request_type, p_customer_name, p_customer_email, p_customer_phone, p_company_name, p_details
  );

  INSERT INTO public.general_request_details (service_request_id, request_type, details)
  VALUES (request_id, p_request_type, btrim(p_details));

  RETURN request_id;
END;
$$;

CREATE FUNCTION public.submit_consultancy_request(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_company_name text,
  p_practice text,
  p_headcount text,
  p_urgency text,
  p_target_date date,
  p_details text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  request_id uuid;
BEGIN
  IF nullif(btrim(p_practice), '') IS NULL THEN
    RAISE EXCEPTION 'Choose a consultancy service.' USING ERRCODE = '23514';
  END IF;

  request_id := public.create_service_request(
    'consultancy', p_customer_name, p_customer_email, p_customer_phone, p_company_name, p_details
  );

  INSERT INTO public.consultancy_request_details (
    service_request_id, practice, headcount, urgency, target_date, details
  ) VALUES (
    request_id, btrim(p_practice), nullif(btrim(p_headcount), ''),
    nullif(btrim(p_urgency), ''), p_target_date, nullif(btrim(p_details), '')
  );

  RETURN request_id;
END;
$$;

CREATE FUNCTION public.submit_procurement_request(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_company_name text,
  p_division text,
  p_timeline text,
  p_quantity text,
  p_destination text,
  p_part_number text,
  p_unit text,
  p_details text,
  p_authorized boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  request_id uuid;
BEGIN
  IF nullif(btrim(p_division), '') IS NULL
    OR nullif(btrim(p_timeline), '') IS NULL
    OR nullif(btrim(p_quantity), '') IS NULL
    OR nullif(btrim(p_destination), '') IS NULL
    OR nullif(btrim(p_details), '') IS NULL
    OR p_authorized IS DISTINCT FROM true
  THEN
    RAISE EXCEPTION 'Complete all required procurement fields and authorization.' USING ERRCODE = '23514';
  END IF;

  request_id := public.create_service_request(
    'procurement', p_customer_name, p_customer_email, p_customer_phone, p_company_name, p_details
  );

  INSERT INTO public.procurement_request_details (
    service_request_id, division, timeline, quantity, destination,
    part_number, unit, details, authorized
  ) VALUES (
    request_id, btrim(p_division), btrim(p_timeline), btrim(p_quantity), btrim(p_destination),
    nullif(btrim(p_part_number), ''), nullif(btrim(p_unit), ''), btrim(p_details), true
  );

  RETURN request_id;
END;
$$;

CREATE FUNCTION public.record_request_attachment(
  p_service_request_id uuid,
  p_object_path text,
  p_original_name text,
  p_content_type text,
  p_size_bytes bigint
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  attachment_id uuid;
BEGIN
  IF split_part(p_object_path, '/', 1) <> p_service_request_id::text
    OR split_part(p_object_path, '/', 2) = ''
    OR split_part(p_object_path, '/', 3) <> ''
    OR p_size_bytes <= 0
    OR p_size_bytes > 26214400
  THEN
    RAISE EXCEPTION 'Invalid attachment metadata.' USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.objects
    WHERE bucket_id = 'supporting-documents' AND name = p_object_path
  ) THEN
    RAISE EXCEPTION 'Uploaded document was not found in private storage.' USING ERRCODE = '23503';
  END IF;

  INSERT INTO public.request_attachments (
    service_request_id, object_path, original_name, content_type, size_bytes
  ) VALUES (
    p_service_request_id, p_object_path, p_original_name, p_content_type, p_size_bytes
  )
  RETURNING id INTO attachment_id;

  RETURN attachment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_general_request(text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_consultancy_request(text, text, text, text, text, text, text, date, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_procurement_request(text, text, text, text, text, text, text, text, text, text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_request_attachment(uuid, text, text, text, bigint) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_general_request(text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_consultancy_request(text, text, text, text, text, text, text, date, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_procurement_request(text, text, text, text, text, text, text, text, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_request_attachment(uuid, text, text, text, bigint) TO anon, authenticated;

CREATE OR REPLACE VIEW public.equipment_catalog AS
SELECT
  equipment.id AS equipment_id,
  asset.id AS asset_id,
  equipment.name,
  equipment.category,
  equipment.brand,
  equipment.model,
  equipment.description,
  equipment.specifications,
  equipment.images,
  asset.location,
  asset.daily_rate,
  asset.asset_code
FROM public.equipment AS equipment
JOIN public.equipment_assets AS asset ON asset.equipment_id = equipment.id
WHERE equipment.is_active
  AND asset.operational_status = 'operational'
  AND asset.availability_status = 'available';

GRANT SELECT ON public.equipment_catalog TO anon, authenticated;

COMMENT ON TABLE public.request_attachments IS
  'Metadata for documents stored in the private supporting-documents bucket.';
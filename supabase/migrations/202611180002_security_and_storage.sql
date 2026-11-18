CREATE TABLE public.staff_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'operations')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.is_equiplink_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_profiles
    WHERE user_id = auth.uid()
      AND is_active
  );
$$;

REVOKE ALL ON FUNCTION public.is_equiplink_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_equiplink_staff() TO authenticated;

CREATE POLICY staff_profiles_read_self
  ON public.staff_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY customers_staff_read
  ON public.customers FOR SELECT TO authenticated
  USING (public.is_equiplink_staff());

CREATE POLICY service_requests_staff_read
  ON public.service_requests FOR SELECT TO authenticated
  USING (public.is_equiplink_staff());

CREATE POLICY equipment_staff_manage
  ON public.equipment FOR ALL TO authenticated
  USING (public.is_equiplink_staff())
  WITH CHECK (public.is_equiplink_staff());

CREATE POLICY equipment_assets_staff_manage
  ON public.equipment_assets FOR ALL TO authenticated
  USING (public.is_equiplink_staff())
  WITH CHECK (public.is_equiplink_staff());

CREATE POLICY equipment_booking_requests_staff_read
  ON public.equipment_booking_requests FOR SELECT TO authenticated
  USING (public.is_equiplink_staff());

CREATE POLICY equipment_booking_requests_staff_update
  ON public.equipment_booking_requests FOR UPDATE TO authenticated
  USING (public.is_equiplink_staff())
  WITH CHECK (public.is_equiplink_staff());

CREATE POLICY equipment_asset_downtime_staff_read
  ON public.equipment_asset_downtime FOR SELECT TO authenticated
  USING (public.is_equiplink_staff());

CREATE POLICY equipment_asset_downtime_staff_insert
  ON public.equipment_asset_downtime FOR INSERT TO authenticated
  WITH CHECK (public.is_equiplink_staff());

CREATE POLICY equipment_asset_downtime_staff_update
  ON public.equipment_asset_downtime FOR UPDATE TO authenticated
  USING (public.is_equiplink_staff())
  WITH CHECK (public.is_equiplink_staff());

GRANT SELECT ON public.staff_profiles TO authenticated;
GRANT SELECT ON public.customers, public.service_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment, public.equipment_assets TO authenticated;
GRANT SELECT, UPDATE ON public.equipment_booking_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.equipment_asset_downtime TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'supporting-documents',
  'supporting-documents',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/acad',
    'image/vnd.dwg'
  ]
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE FUNCTION public.can_upload_supporting_document(object_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  request_folder text;
  request_id uuid;
BEGIN
  request_folder := split_part(object_name, '/', 1);

  IF split_part(object_name, '/', 2) = ''
    OR split_part(object_name, '/', 3) <> ''
    OR request_folder !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  THEN
    RETURN false;
  END IF;

  request_id := request_folder::uuid;
  RETURN EXISTS (
    SELECT 1
    FROM public.service_requests
    WHERE id = request_id
  );
EXCEPTION WHEN invalid_text_representation THEN
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.can_upload_supporting_document(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_upload_supporting_document(text) TO anon, authenticated;

CREATE POLICY supporting_documents_upload_for_existing_request
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'supporting-documents'
    AND public.can_upload_supporting_document(name)
  );

CREATE POLICY supporting_documents_staff_manage
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'supporting-documents'
    AND public.is_equiplink_staff()
  )
  WITH CHECK (
    bucket_id = 'supporting-documents'
    AND public.is_equiplink_staff()
  );

COMMENT ON TABLE public.staff_profiles IS
  'Staff authorization profiles. Provision records through trusted administrative tooling only.';
COMMENT ON FUNCTION public.can_upload_supporting_document(text) IS
  'Allows uploads only beneath an existing service request UUID folder; the bucket remains private.';
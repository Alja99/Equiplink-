ALTER TABLE public.service_requests
  ADD COLUMN status text NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending', 'in_review', 'approved', 'confirmed', 'dispatched',
      'docs_verified', 'quote_prepared', 'completed', 'cancelled', 'rejected'
    )),
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX service_requests_status_created_idx
  ON public.service_requests (status, created_at DESC);

CREATE TABLE public.request_status_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX request_status_history_request_idx
  ON public.request_status_history (service_request_id, changed_at DESC);

ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY request_status_history_staff_read
  ON public.request_status_history FOR SELECT TO authenticated
  USING (public.is_equiplink_staff());

GRANT SELECT ON public.request_status_history TO authenticated;

CREATE FUNCTION public.record_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.request_status_history (service_request_id, new_status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.request_status_history (
      service_request_id, previous_status, new_status, changed_by
    ) VALUES (
      NEW.id, OLD.status, NEW.status, auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER service_request_status_history
AFTER INSERT OR UPDATE OF status ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.record_request_status_change();

CREATE FUNCTION public.update_service_request_status(
  p_service_request_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  request_division text;
  mapped_booking_status text;
BEGIN
  IF NOT public.is_equiplink_staff() THEN
    RAISE EXCEPTION 'Only authorized EquipLink staff can update requests.' USING ERRCODE = '42501';
  END IF;

  SELECT division INTO request_division
  FROM public.service_requests
  WHERE id = p_service_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request was not found.' USING ERRCODE = 'P0002';
  END IF;

  IF p_status NOT IN (
    'pending', 'in_review', 'approved', 'confirmed', 'dispatched',
    'docs_verified', 'quote_prepared', 'completed', 'cancelled', 'rejected'
  ) THEN
    RAISE EXCEPTION 'Invalid request status.' USING ERRCODE = '23514';
  END IF;

  IF request_division = 'equipment' THEN
    IF p_status NOT IN ('pending', 'approved', 'confirmed', 'dispatched', 'completed', 'cancelled', 'rejected') THEN
      RAISE EXCEPTION 'Invalid equipment booking status.' USING ERRCODE = '23514';
    END IF;

    mapped_booking_status := CASE p_status
      WHEN 'dispatched' THEN 'confirmed'
      ELSE p_status
    END;

    UPDATE public.equipment_booking_requests
    SET booking_status = mapped_booking_status
    WHERE service_request_id = p_service_request_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Equipment booking details were not found.' USING ERRCODE = 'P0002';
    END IF;
  ELSIF request_division = 'consultancy' THEN
    IF p_status NOT IN ('pending', 'in_review', 'docs_verified', 'completed', 'cancelled', 'rejected') THEN
      RAISE EXCEPTION 'Invalid consultancy request status.' USING ERRCODE = '23514';
    END IF;
  ELSIF request_division = 'procurement' THEN
    IF p_status NOT IN ('pending', 'in_review', 'quote_prepared', 'completed', 'cancelled', 'rejected') THEN
      RAISE EXCEPTION 'Invalid procurement request status.' USING ERRCODE = '23514';
    END IF;
  ELSIF p_status NOT IN ('pending', 'in_review', 'completed', 'cancelled', 'rejected') THEN
    RAISE EXCEPTION 'Invalid general request status.' USING ERRCODE = '23514';
  END IF;

  UPDATE public.service_requests
  SET status = p_status,
      updated_at = now()
  WHERE id = p_service_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_service_request_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_service_request_status(uuid, text) TO authenticated;
REVOKE UPDATE ON public.equipment_booking_requests FROM authenticated;

COMMENT ON TABLE public.request_status_history IS
  'Audit trail for service request status transitions; only authorized staff can read it.';
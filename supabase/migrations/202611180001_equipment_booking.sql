CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX customers_email_lower_uidx ON public.customers (lower(email));

CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  division text NOT NULL CHECK (division IN ('equipment', 'consultancy', 'procurement', 'contact', 'partner')),
  general_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX service_requests_customer_created_idx
  ON public.service_requests (customer_id, created_at DESC);

CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  brand text,
  model text,
  description text,
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  images text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX equipment_category_idx ON public.equipment (category);

CREATE TABLE public.equipment_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id),
  asset_code text NOT NULL UNIQUE,
  registration_number text UNIQUE,
  location text NOT NULL,
  operational_status text NOT NULL DEFAULT 'operational'
    CHECK (operational_status IN ('operational', 'maintenance', 'out_of_service')),
  availability_status text NOT NULL DEFAULT 'available'
    CHECK (availability_status IN ('available', 'unavailable')),
  daily_rate numeric(12, 2) NOT NULL CHECK (daily_rate >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX equipment_assets_equipment_idx ON public.equipment_assets (equipment_id);
CREATE INDEX equipment_assets_bookable_idx
  ON public.equipment_assets (equipment_id, location)
  WHERE operational_status = 'operational' AND availability_status = 'available';

CREATE TABLE public.equipment_booking_requests (
  service_request_id uuid PRIMARY KEY REFERENCES public.service_requests(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.equipment_assets(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  rental_duration_seconds bigint GENERATED ALWAYS AS
    (extract(epoch FROM (ends_at - starts_at))::bigint) STORED,
  delivery_location text NOT NULL,
  additional_requirements text,
  booking_status text NOT NULL DEFAULT 'pending'
    CHECK (booking_status IN ('pending', 'approved', 'confirmed', 'cancelled', 'rejected', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  EXCLUDE USING gist (
    asset_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (booking_status IN ('pending', 'approved', 'confirmed'))
);

CREATE INDEX equipment_booking_requests_start_idx
  ON public.equipment_booking_requests (starts_at DESC);

CREATE TABLE public.equipment_asset_downtime (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.equipment_assets(id),
  downtime_type text NOT NULL CHECK (downtime_type IN ('maintenance', 'out_of_service')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  downtime_status text NOT NULL DEFAULT 'scheduled'
    CHECK (downtime_status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  EXCLUDE USING gist (
    asset_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (downtime_status IN ('scheduled', 'in_progress'))
);

CREATE INDEX equipment_asset_downtime_asset_start_idx
  ON public.equipment_asset_downtime (asset_id, starts_at);

CREATE FUNCTION public.validate_equipment_booking()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  asset public.equipment_assets%ROWTYPE;
  request_division text;
BEGIN
  SELECT * INTO asset
  FROM public.equipment_assets
  WHERE id = NEW.asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Equipment asset does not exist.' USING ERRCODE = '23503';
  END IF;

  SELECT division INTO request_division
  FROM public.service_requests
  WHERE id = NEW.service_request_id;

  IF request_division IS DISTINCT FROM 'equipment' THEN
    RAISE EXCEPTION 'Booking must reference an equipment service request.' USING ERRCODE = '23514';
  END IF;

  IF NEW.booking_status IN ('pending', 'approved', 'confirmed') THEN
    IF asset.operational_status <> 'operational' OR asset.availability_status <> 'available' THEN
      RAISE EXCEPTION 'Equipment asset is not available for booking.' USING ERRCODE = '23P01';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.equipment_asset_downtime AS downtime
      WHERE downtime.asset_id = NEW.asset_id
        AND downtime.downtime_status IN ('scheduled', 'in_progress')
        AND tstzrange(downtime.starts_at, downtime.ends_at, '[)')
          && tstzrange(NEW.starts_at, NEW.ends_at, '[)')
    ) THEN
      RAISE EXCEPTION 'Equipment asset has maintenance or downtime during the requested period.'
        USING ERRCODE = '23P01';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER equipment_booking_validate
BEFORE INSERT OR UPDATE OF asset_id, starts_at, ends_at, booking_status
ON public.equipment_booking_requests
FOR EACH ROW EXECUTE FUNCTION public.validate_equipment_booking();

CREATE FUNCTION public.validate_equipment_downtime()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  asset public.equipment_assets%ROWTYPE;
BEGIN
  SELECT * INTO asset
  FROM public.equipment_assets
  WHERE id = NEW.asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Equipment asset does not exist.' USING ERRCODE = '23503';
  END IF;

  IF NEW.downtime_status IN ('scheduled', 'in_progress') AND EXISTS (
    SELECT 1
    FROM public.equipment_booking_requests AS booking
    WHERE booking.asset_id = NEW.asset_id
      AND booking.booking_status IN ('pending', 'approved', 'confirmed')
      AND tstzrange(booking.starts_at, booking.ends_at, '[)')
        && tstzrange(NEW.starts_at, NEW.ends_at, '[)')
  ) THEN
    RAISE EXCEPTION 'Downtime cannot overlap a pending, approved, or confirmed booking.'
      USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER equipment_downtime_validate
BEFORE INSERT OR UPDATE OF asset_id, starts_at, ends_at, downtime_status
ON public.equipment_asset_downtime
FOR EACH ROW EXECUTE FUNCTION public.validate_equipment_downtime();

CREATE FUNCTION public.submit_equipment_booking(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_company_name text,
  p_asset_id uuid,
  p_start_local timestamp without time zone,
  p_end_local timestamp without time zone,
  p_delivery_location text,
  p_additional_requirements text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  customer_id uuid;
  request_id uuid;
  start_time timestamptz;
  end_time timestamptz;
BEGIN
  IF nullif(btrim(p_customer_name), '') IS NULL
    OR nullif(btrim(p_customer_email), '') IS NULL
    OR nullif(btrim(p_delivery_location), '') IS NULL
  THEN
    RAISE EXCEPTION 'Customer name, email, and delivery location are required.'
      USING ERRCODE = '23514';
  END IF;

  IF p_start_local IS NULL OR p_end_local IS NULL OR p_end_local <= p_start_local THEN
    RAISE EXCEPTION 'A valid start and end date/time are required.' USING ERRCODE = '23514';
  END IF;

  start_time := p_start_local AT TIME ZONE 'Africa/Monrovia';
  end_time := p_end_local AT TIME ZONE 'Africa/Monrovia';

  INSERT INTO public.customers (full_name, email, phone, company_name)
  VALUES (btrim(p_customer_name), btrim(p_customer_email), nullif(btrim(p_customer_phone), ''), nullif(btrim(p_company_name), ''))
  ON CONFLICT ((lower(email))) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, public.customers.phone),
        company_name = COALESCE(EXCLUDED.company_name, public.customers.company_name),
        updated_at = now()
  RETURNING id INTO customer_id;

  INSERT INTO public.service_requests (customer_id, division)
  VALUES (customer_id, 'equipment')
  RETURNING id INTO request_id;

  INSERT INTO public.equipment_booking_requests (
    service_request_id,
    asset_id,
    starts_at,
    ends_at,
    delivery_location,
    additional_requirements
  )
  VALUES (
    request_id,
    p_asset_id,
    start_time,
    end_time,
    btrim(p_delivery_location),
    nullif(btrim(p_additional_requirements), '')
  );

  RETURN request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_equipment_booking(text, text, text, text, uuid, timestamp without time zone, timestamp without time zone, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_equipment_booking(text, text, text, text, uuid, timestamp without time zone, timestamp without time zone, text, text) TO anon, authenticated;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_asset_downtime ENABLE ROW LEVEL SECURITY;

CREATE VIEW public.equipment_catalog AS
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
  asset.daily_rate
FROM public.equipment AS equipment
JOIN public.equipment_assets AS asset ON asset.equipment_id = equipment.id
WHERE equipment.is_active
  AND asset.operational_status = 'operational'
  AND asset.availability_status = 'available';

GRANT SELECT ON public.equipment_catalog TO anon, authenticated;

COMMENT ON TABLE public.equipment_booking_requests IS
  'Equipment enquiries and bookings. Pending, approved, and confirmed rows hold their asset interval.';
COMMENT ON COLUMN public.equipment_booking_requests.starts_at IS
  'Stored as an absolute timestamptz; submit_equipment_booking interprets customer-local input in Africa/Monrovia.';
COMMENT ON COLUMN public.equipment_assets.availability_status IS
  'Manual bookability override. Date-specific booked and downtime states are derived from booking and downtime intervals.';
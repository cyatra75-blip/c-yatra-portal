-- ============================================================
-- C-YATRA COMPLETE DATABASE SETUP (Schema + RLS + Seed Data)
-- Safe to run in Supabase SQL Editor (Idempotent)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Globe',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_order_active ON public.categories(sort_order ASC, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 3. PORTALS TABLE
CREATE TABLE IF NOT EXISTS public.portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  internal_notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_portals_category_order ON public.portals(category_id, sort_order ASC, is_active);
CREATE INDEX IF NOT EXISTS idx_portals_name ON public.portals(name);

-- 4. HELPER SECURITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_authorized_cyatra_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portals ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Categories Policies
DROP POLICY IF EXISTS "Authorized users can read categories" ON public.categories;
CREATE POLICY "Authorized users can read categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR (public.is_authorized_cyatra_user() AND is_active = true)
  );

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Portals Policies
DROP POLICY IF EXISTS "Authorized users can read portals" ON public.portals;
CREATE POLICY "Authorized users can read portals"
  ON public.portals FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR (
      public.is_authorized_cyatra_user() 
      AND is_active = true 
      AND category_id IN (SELECT id FROM public.categories WHERE is_active = true)
    )
  );

DROP POLICY IF EXISTS "Admins can insert portals" ON public.portals;
CREATE POLICY "Admins can insert portals"
  ON public.portals FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update portals" ON public.portals;
CREATE POLICY "Admins can update portals"
  ON public.portals FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete portals" ON public.portals;
CREATE POLICY "Admins can delete portals"
  ON public.portals FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6. TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_categories_updated ON public.categories;
CREATE TRIGGER on_categories_updated
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_portals_updated ON public.portals;
CREATE TRIGGER on_portals_updated
  BEFORE UPDATE ON public.portals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 7. DEFAULT CATEGORIES SEED DATA (Valid Hex UUIDs: c1000000-...)
INSERT INTO public.categories (id, name, slug, icon, sort_order, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Flight', 'flight', 'Plane', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'Fix Departure', 'fix-departure', 'Users', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Hotel', 'hotel', 'Bed', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Online Cab', 'online-cab', 'Car', 4, true),
  ('c1000000-0000-0000-0000-000000000005', 'Villa', 'villa', 'Home', 5, true),
  ('c1000000-0000-0000-0000-000000000006', 'Home Stay', 'home-stay', 'Building2', 6, true),
  ('c1000000-0000-0000-0000-000000000007', 'Bus', 'bus', 'Bus', 7, true),
  ('c1000000-0000-0000-0000-000000000008', 'Train', 'train', 'Train', 8, true),
  ('c1000000-0000-0000-0000-000000000009', 'Visa', 'visa', 'Globe', 9, true),
  ('c1000000-0000-0000-0000-000000000010', 'Insurance', 'insurance', 'ShieldCheck', 10, true)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order;

-- 8. DEFAULT PORTALS SEED DATA (Valid Hex UUIDs: b1000000-...)
INSERT INTO public.portals (id, category_id, name, website_url, logo_url, description, internal_notes, sort_order, is_active)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'MakeMyTrip', 'https://www.makemytrip.com/flights/', '/portals/makemytrip.svg', 'Domestic & International Flights', 'Primary partner for instant tickets', 1, true),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Ixigo', 'https://www.ixigo.com/flights', '/portals/ixigo.svg', 'Compare Flight Prices', 'Great for low budget routes', 2, true),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Cleartrip', 'https://www.cleartrip.com/flights', '/portals/cleartrip.svg', 'Domestic & International Flights', 'Fast search interface', 3, true),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Skyscanner', 'https://www.skyscanner.co.in/', '/portals/skyscanner.svg', 'Global Flight Search', 'Best international comparisons', 4, true),
  ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Google Flights', 'https://www.google.com/travel/flights', '/portals/googleflights.svg', 'Compare Flights Worldwide', 'Calendar date grid view', 5, true),
  ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Bookings.com', 'https://www.booking.com/flights/', '/portals/booking.svg', 'Flights, Hotels & Packages', 'Global itinerary combinations', 6, true),
  ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'Yatra', 'https://www.yatra.com/flights', '/portals/yatra.svg', 'Flights, Hotels & Holidays', 'Corporate and holiday fares', 7, true),
  ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000001', 'Trip.com', 'https://www.trip.com/flights/', '/portals/trip.svg', 'International Flight Bookings', 'Excellent Asia connectivity', 8, true),
  ('b1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000001', 'EaseMyTrip', 'https://www.easemytrip.com/flights', '/portals/easemytrip.svg', 'Best Fares on Flights', 'Zero convenience fee offers', 9, true),
  ('b1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000001', 'Alternative Airlines', 'https://www.alternativeairlines.com/', '/portals/alternativeairlines.svg', 'Compare 600+ Airlines', 'Remote and regional airlines', 10, true),

  -- Fix Departure
  ('b1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000002', 'Travel Boutique Online', 'https://www.travelboutiqueonline.com/', '/portals/travelboutique.svg', 'B2B Group & Fixed Departures', 'Leading B2B series bookings', 1, true),
  ('b1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000002', 'Riya Travel', 'https://www.riya.travel/', '/portals/makemytrip.svg', 'Fixed Group Fares & Bulk Seats', 'Consolidated airline block seats', 2, true),

  -- Hotel
  ('b1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000003', 'Booking.com', 'https://www.booking.com/', '/portals/booking.svg', 'Worldwide Hotels & Resorts', 'Pay at property availability', 1, true),
  ('b1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000003', 'Agoda', 'https://www.agoda.com/', '/portals/agoda.svg', 'Best Rates on Asia & Global Stays', 'Special mobile & agency rates', 2, true),
  ('b1000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000003', 'MakeMyTrip Hotels', 'https://www.makemytrip.com/hotels/', '/portals/makemytrip.svg', 'Premium & Budget Hotel Stays', 'Direct domestic hotel inventory', 3, true),
  ('b1000000-0000-0000-0000-000000000016', 'c1000000-0000-0000-0000-000000000003', 'Goibibo', 'https://www.goibibo.com/hotels/', '/portals/goibibo.svg', 'Verified Hotel Reviews & Deals', 'Instant voucher confirmation', 4, true),
  ('b1000000-0000-0000-0000-000000000017', 'c1000000-0000-0000-0000-000000000003', 'Cleartrip Hotels', 'https://www.cleartrip.com/hotels', '/portals/cleartrip.svg', 'Instant Hotel Reservations', 'Fast search with amenities filter', 5, true),

  -- Online Cab
  ('b1000000-0000-0000-0000-000000000018', 'c1000000-0000-0000-0000-000000000004', 'Savaari', 'https://www.savaari.com/', '/portals/savaari.svg', 'Car Rentals & Chauffeur Services', 'Outstation one-way & round trip', 1, true),
  ('b1000000-0000-0000-0000-000000000019', 'c1000000-0000-0000-0000-000000000004', 'MakeMyTrip Cabs', 'https://www.makemytrip.com/cabs/', '/portals/makemytrip.svg', 'Outstation & Airport Transfers', 'GPS tracked verified drivers', 2, true),

  -- Villa
  ('b1000000-0000-0000-0000-000000000020', 'c1000000-0000-0000-0000-000000000005', 'Airbnb Luxury', 'https://www.airbnb.co.in/luxury', '/portals/airbnb.svg', 'Exclusive Private Luxury Villas', 'Curated luxury estates & pools', 1, true),

  -- Home Stay
  ('b1000000-0000-0000-0000-000000000021', 'c1000000-0000-0000-0000-000000000006', 'Airbnb Homestays', 'https://www.airbnb.co.in/', '/portals/airbnb.svg', 'Authentic Local Homestays', 'Local host hospitality', 1, true),

  -- Bus
  ('b1000000-0000-0000-0000-000000000022', 'c1000000-0000-0000-0000-000000000007', 'RedBus', 'https://www.redbus.in/', '/portals/redbus.svg', 'India''s Largest Online Bus Ticketing', 'Sleeper and Volvo bus inventory', 1, true),

  -- Train
  ('b1000000-0000-0000-0000-000000000023', 'c1000000-0000-0000-0000-000000000008', 'IRCTC NextGen', 'https://www.irctc.co.in/', '/portals/irctc.svg', 'Official Indian Railway Booking', 'Official reservation system', 1, true),

  -- Visa
  ('b1000000-0000-0000-0000-000000000024', 'c1000000-0000-0000-0000-000000000009', 'Atlys', 'https://www.atlys.com/', '/portals/atlys.svg', 'Fast Online Tourist Visa Processing', 'Guaranteed visa turnaround', 1, true),
  ('b1000000-0000-0000-0000-000000000025', 'c1000000-0000-0000-0000-000000000009', 'VFS Global', 'https://www.vfsglobal.com/', '/portals/vfs.svg', 'Official Visa Application Center', 'Embassy appointment booking', 2, true),

  -- Insurance
  ('b1000000-0000-0000-0000-000000000026', 'c1000000-0000-0000-0000-000000000010', 'PolicyBazaar Travel', 'https://travel.policybazaar.com/', '/portals/policybazaar.svg', 'Compare International Travel Insurance', 'Medical & trip delay protection', 1, true)
ON CONFLICT (id) DO NOTHING;

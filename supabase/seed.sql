-- C-Yatra Seed Data
-- 1. Insert Default Categories
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

-- 2. Insert Default Portals
-- Flight Portals (c1000000-0000-0000-0000-000000000001)
INSERT INTO public.portals (id, category_id, name, website_url, logo_url, description, internal_notes, sort_order, is_active)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'MakeMyTrip', 'https://www.makemytrip.com/flights/', '/portals/makemytrip.svg', 'Domestic & International Flights', 'Primary partner for instant tickets', 1, true),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Ixigo', 'https://www.ixigo.com/flights', '/portals/ixigo.svg', 'Compare Flight Prices', 'Great for low budget routes', 2, true),
  ('p1000000-0000-0000-0000-0000000000013', 'c1000000-0000-0000-0000-000000000001', 'Cleartrip', 'https://www.cleartrip.com/flights', '/portals/cleartrip.svg', 'Domestic & International Flights', 'Fast search interface', 3, true),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Skyscanner', 'https://www.skyscanner.co.in/', '/portals/skyscanner.svg', 'Global Flight Search', 'Best international comparisons', 4, true),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Google Flights', 'https://www.google.com/travel/flights', '/portals/googleflights.svg', 'Compare Flights Worldwide', 'Calendar date grid view', 5, true),
  ('p1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Bookings.com', 'https://www.booking.com/flights/', '/portals/booking.svg', 'Flights, Hotels & Packages', 'Global itinerary combinations', 6, true),
  ('p1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'Yatra', 'https://www.yatra.com/flights', '/portals/yatra.svg', 'Flights, Hotels & Holidays', 'Corporate and holiday fares', 7, true),
  ('p1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000001', 'Trip.com', 'https://www.trip.com/flights/', '/portals/trip.svg', 'International Flight Bookings', 'Excellent Asia connectivity', 8, true),
  ('p1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000001', 'EaseMyTrip', 'https://www.easemytrip.com/flights', '/portals/easemytrip.svg', 'Best Fares on Flights', 'Zero convenience fee offers', 9, true),
  ('p1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000001', 'Alternative Airlines', 'https://www.alternativeairlines.com/', '/portals/alternativeairlines.svg', 'Compare 600+ Airlines', 'Remote and regional airlines', 10, true),

-- Fix Departure Portals (c1000000-0000-0000-0000-000000000002)
  ('p1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000002', 'Travel Boutique Online', 'https://www.travelboutiqueonline.com/', '/portals/travelboutique.svg', 'B2B Group & Fixed Departures', 'Leading B2B series bookings', 1, true),
  ('p1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000002', 'Riya Travel', 'https://www.riya.travel/', '/portals/makemytrip.svg', 'Fixed Group Fares & Bulk Seats', 'Consolidated airline block seats', 2, true),

-- Hotel Portals (c1000000-0000-0000-0000-000000000003)
  ('p1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000003', 'Booking.com', 'https://www.booking.com/', '/portals/booking.svg', 'Worldwide Hotels & Resorts', 'Pay at property availability', 1, true),
  ('p1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000003', 'Agoda', 'https://www.agoda.com/', '/portals/agoda.svg', 'Best Rates on Asia & Global Stays', 'Special mobile & agency rates', 2, true),
  ('p1000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000003', 'MakeMyTrip Hotels', 'https://www.makemytrip.com/hotels/', '/portals/makemytrip.svg', 'Premium & Budget Hotel Stays', 'Direct domestic hotel inventory', 3, true),
  ('p1000000-0000-0000-0000-000000000016', 'c1000000-0000-0000-0000-000000000003', 'Goibibo', 'https://www.goibibo.com/hotels/', '/portals/goibibo.svg', 'Verified Hotel Reviews & Deals', 'Instant voucher confirmation', 4, true),
  ('p1000000-0000-0000-0000-000000000017', 'c1000000-0000-0000-0000-000000000003', 'Cleartrip Hotels', 'https://www.cleartrip.com/hotels', '/portals/cleartrip.svg', 'Instant Hotel Reservations', 'Fast search with amenities filter', 5, true),

-- Online Cab Portals (c1000000-0000-0000-0000-000000000004)
  ('p1000000-0000-0000-0000-000000000018', 'c1000000-0000-0000-0000-000000000004', 'Savaari', 'https://www.savaari.com/', '/portals/savaari.svg', 'Car Rentals & Chauffeur Services', 'Outstation one-way & round trip', 1, true),
  ('p1000000-0000-0000-0000-000000000019', 'c1000000-0000-0000-0000-000000000004', 'MakeMyTrip Cabs', 'https://www.makemytrip.com/cabs/', '/portals/makemytrip.svg', 'Outstation & Airport Transfers', 'GPS tracked verified drivers', 2, true),

-- Villa Portals (c1000000-0000-0000-0000-000000000005)
  ('p1000000-0000-0000-0000-000000000020', 'c1000000-0000-0000-0000-000000000005', 'Airbnb Luxury', 'https://www.airbnb.co.in/luxury', '/portals/airbnb.svg', 'Exclusive Private Luxury Villas', 'Curated luxury estates & pools', 1, true),

-- Home Stay Portals (c1000000-0000-0000-0000-000000000006)
  ('p1000000-0000-0000-0000-000000000021', 'c1000000-0000-0000-0000-000000000006', 'Airbnb Homestays', 'https://www.airbnb.co.in/', '/portals/airbnb.svg', 'Authentic Local Homestays', 'Local host hospitality', 1, true),

-- Bus Portals (c1000000-0000-0000-0000-000000000007)
  ('p1000000-0000-0000-0000-000000000022', 'c1000000-0000-0000-0000-000000000007', 'RedBus', 'https://www.redbus.in/', '/portals/redbus.svg', 'India''s Largest Online Bus Ticketing', 'Sleeper and Volvo bus inventory', 1, true),

-- Train Portals (c1000000-0000-0000-0000-000000000008)
  ('p1000000-0000-0000-0000-000000000023', 'c1000000-0000-0000-0000-000000000008', 'IRCTC NextGen', 'https://www.irctc.co.in/', '/portals/irctc.svg', 'Official Indian Railway Booking', 'Official reservation system', 1, true),

-- Visa Portals (c1000000-0000-0000-0000-000000000009)
  ('p1000000-0000-0000-0000-000000000024', 'c1000000-0000-0000-0000-000000000009', 'Atlys', 'https://www.atlys.com/', '/portals/atlys.svg', 'Fast Online Tourist Visa Processing', 'Guaranteed visa turnaround', 1, true),
  ('p1000000-0000-0000-0000-000000000025', 'c1000000-0000-0000-0000-000000000009', 'VFS Global', 'https://www.vfsglobal.com/', '/portals/vfs.svg', 'Official Visa Application Center', 'Embassy appointment booking', 2, true),

-- Insurance Portals (c1000000-0000-0000-0000-000000000010)
  ('p1000000-0000-0000-0000-000000000026', 'c1000000-0000-0000-0000-000000000010', 'PolicyBazaar Travel', 'https://travel.policybazaar.com/', '/portals/policybazaar.svg', 'Compare International Travel Insurance', 'Medical & trip delay protection', 1, true)
ON CONFLICT (id) DO NOTHING;

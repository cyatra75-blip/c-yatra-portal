import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== C-YATRA Database Seed Runner ===\n');

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
  console.log('ℹ️ Supabase environment variables not configured. Skipping remote database seed.');
  console.log('To seed your live Supabase project, configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local\n');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_CATEGORIES = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Flight', slug: 'flight', icon: 'Plane', sort_order: 1, is_active: true },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Fix Departure', slug: 'fix-departure', icon: 'Users', sort_order: 2, is_active: true },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Hotel', slug: 'hotel', icon: 'Bed', sort_order: 3, is_active: true },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Online Cab', slug: 'online-cab', icon: 'Car', sort_order: 4, is_active: true },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'Villa', slug: 'villa', icon: 'Home', sort_order: 5, is_active: true },
  { id: 'c1000000-0000-0000-0000-000000000006', name: 'Home Stay', slug: 'home-stay', icon: 'Building2', sort_order: 6, is_active: true },
  { id: 'c1000000-0000-0000-0000-000000000007', name: 'Bus', slug: 'bus', icon: 'Bus', sort_order: 7, is_active: true },
  { id: 'c1000000-0000-0000-0000-000000000008', name: 'Train', slug: 'train', icon: 'Train', sort_order: 8, is_active: true },
  { id: 'c1000000-0000-0000-0000-000000000009', name: 'Visa', slug: 'visa', icon: 'Globe', sort_order: 9, is_active: true },
  { id: 'c1000000-0000-0000-0000-000000000010', name: 'Insurance', slug: 'insurance', icon: 'ShieldCheck', sort_order: 10, is_active: true },
];

const DEFAULT_PORTALS = [
  // Flight Portals
  { id: 'p1000000-0000-0000-0000-000000000001', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'MakeMyTrip', website_url: 'https://www.makemytrip.com/flights/', logo_url: '/portals/makemytrip.svg', description: 'Domestic & International Flights', internal_notes: 'Primary partner for instant tickets', sort_order: 1, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000002', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Ixigo', website_url: 'https://www.ixigo.com/flights', logo_url: '/portals/ixigo.svg', description: 'Compare Flight Prices', internal_notes: null, sort_order: 2, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000003', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Cleartrip', website_url: 'https://www.cleartrip.com/flights', logo_url: '/portals/cleartrip.svg', description: 'Domestic & International Flights', internal_notes: null, sort_order: 3, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000004', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Skyscanner', website_url: 'https://www.skyscanner.co.in/', logo_url: '/portals/skyscanner.svg', description: 'Global Flight Search', internal_notes: null, sort_order: 4, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000005', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Google Flights', website_url: 'https://www.google.com/travel/flights', logo_url: '/portals/googleflights.svg', description: 'Compare Flights Worldwide', internal_notes: null, sort_order: 5, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000006', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Bookings.com', website_url: 'https://www.booking.com/flights/', logo_url: '/portals/booking.svg', description: 'Flights, Hotels & Packages', internal_notes: null, sort_order: 6, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000007', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Yatra', website_url: 'https://www.yatra.com/flights', logo_url: '/portals/yatra.svg', description: 'Flights, Hotels & Holidays', internal_notes: null, sort_order: 7, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000008', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Trip.com', website_url: 'https://www.trip.com/flights/', logo_url: '/portals/trip.svg', description: 'International Flight Bookings', internal_notes: null, sort_order: 8, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000009', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'EaseMyTrip', website_url: 'https://www.easemytrip.com/flights', logo_url: '/portals/easemytrip.svg', description: 'Best Fares on Flights', internal_notes: null, sort_order: 9, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000010', category_id: 'c1000000-0000-0000-0000-000000000001', name: 'Alternative Airlines', website_url: 'https://www.alternativeairlines.com/', logo_url: '/portals/alternativeairlines.svg', description: 'Compare 600+ Airlines', internal_notes: null, sort_order: 10, is_active: true },

  // Fix Departure Portals
  { id: 'p1000000-0000-0000-0000-000000000011', category_id: 'c1000000-0000-0000-0000-000000000002', name: 'Travel Boutique Online', website_url: 'https://www.travelboutiqueonline.com/', logo_url: '/portals/travelboutique.svg', description: 'B2B Group & Fixed Departures', internal_notes: null, sort_order: 1, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000012', category_id: 'c1000000-0000-0000-0000-000000000002', name: 'Riya Travel', website_url: 'https://www.riya.travel/', logo_url: '/portals/makemytrip.svg', description: 'Fixed Group Fares & Bulk Seats', internal_notes: null, sort_order: 2, is_active: true },

  // Hotel Portals
  { id: 'p1000000-0000-0000-0000-000000000013', category_id: 'c1000000-0000-0000-0000-000000000003', name: 'Booking.com', website_url: 'https://www.booking.com/', logo_url: '/portals/booking.svg', description: 'Worldwide Hotels & Resorts', internal_notes: null, sort_order: 1, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000014', category_id: 'c1000000-0000-0000-0000-000000000003', name: 'Agoda', website_url: 'https://www.agoda.com/', logo_url: '/portals/agoda.svg', description: 'Best Rates on Asia & Global Stays', internal_notes: null, sort_order: 2, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000015', category_id: 'c1000000-0000-0000-0000-000000000003', name: 'MakeMyTrip Hotels', website_url: 'https://www.makemytrip.com/hotels/', logo_url: '/portals/makemytrip.svg', description: 'Premium & Budget Hotel Stays', internal_notes: null, sort_order: 3, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000016', category_id: 'c1000000-0000-0000-0000-000000000003', name: 'Goibibo', website_url: 'https://www.goibibo.com/hotels/', logo_url: '/portals/goibibo.svg', description: 'Verified Hotel Reviews & Deals', internal_notes: null, sort_order: 4, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000017', category_id: 'c1000000-0000-0000-0000-000000000003', name: 'Cleartrip Hotels', website_url: 'https://www.cleartrip.com/hotels', logo_url: '/portals/cleartrip.svg', description: 'Instant Hotel Reservations', internal_notes: null, sort_order: 5, is_active: true },

  // Online Cab
  { id: 'p1000000-0000-0000-0000-000000000018', category_id: 'c1000000-0000-0000-0000-000000000004', name: 'Savaari', website_url: 'https://www.savaari.com/', logo_url: '/portals/savaari.svg', description: 'Car Rentals & Chauffeur Services', internal_notes: null, sort_order: 1, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000019', category_id: 'c1000000-0000-0000-0000-000000000004', name: 'MakeMyTrip Cabs', website_url: 'https://www.makemytrip.com/cabs/', logo_url: '/portals/makemytrip.svg', description: 'Outstation & Airport Transfers', internal_notes: null, sort_order: 2, is_active: true },

  // Villa
  { id: 'p1000000-0000-0000-0000-000000000020', category_id: 'c1000000-0000-0000-0000-000000000005', name: 'Airbnb Luxury', website_url: 'https://www.airbnb.co.in/luxury', logo_url: '/portals/airbnb.svg', description: 'Exclusive Private Luxury Villas', internal_notes: null, sort_order: 1, is_active: true },

  // Home Stay
  { id: 'p1000000-0000-0000-0000-000000000021', category_id: 'c1000000-0000-0000-0000-000000000006', name: 'Airbnb Homestays', website_url: 'https://www.airbnb.co.in/', logo_url: '/portals/airbnb.svg', description: 'Authentic Local Homestays', internal_notes: null, sort_order: 1, is_active: true },

  // Bus
  { id: 'p1000000-0000-0000-0000-000000000022', category_id: 'c1000000-0000-0000-0000-000000000007', name: 'RedBus', website_url: 'https://www.redbus.in/', logo_url: '/portals/redbus.svg', description: 'India\'s Largest Online Bus Ticketing', internal_notes: null, sort_order: 1, is_active: true },

  // Train
  { id: 'p1000000-0000-0000-0000-000000000023', category_id: 'c1000000-0000-0000-0000-000000000008', name: 'IRCTC NextGen', website_url: 'https://www.irctc.co.in/', logo_url: '/portals/irctc.svg', description: 'Official Indian Railway Booking', internal_notes: null, sort_order: 1, is_active: true },

  // Visa
  { id: 'p1000000-0000-0000-0000-000000000024', category_id: 'c1000000-0000-0000-0000-000000000009', name: 'Atlys', website_url: 'https://www.atlys.com/', logo_url: '/portals/atlys.svg', description: 'Fast Online Tourist Visa Processing', internal_notes: null, sort_order: 1, is_active: true },
  { id: 'p1000000-0000-0000-0000-000000000025', category_id: 'c1000000-0000-0000-0000-000000000009', name: 'VFS Global', website_url: 'https://www.vfsglobal.com/', logo_url: '/portals/vfs.svg', description: 'Official Visa Application Center', internal_notes: null, sort_order: 2, is_active: true },

  // Insurance
  { id: 'p1000000-0000-0000-0000-000000000026', category_id: 'c1000000-0000-0000-0000-000000000010', name: 'PolicyBazaar Travel', website_url: 'https://travel.policybazaar.com/', logo_url: '/portals/policybazaar.svg', description: 'Compare International Travel Insurance', internal_notes: null, sort_order: 1, is_active: true },
];

async function seed() {
  console.log('🌱 Seeding default categories into Supabase...');
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert(DEFAULT_CATEGORIES, { onConflict: 'slug' })
    .select();

  if (catError) {
    console.error('❌ Error seeding categories:', catError.message);
    process.exit(1);
  }
  console.log(`✓ Seeded ${DEFAULT_CATEGORIES.length} categories.`);

  console.log('🌱 Seeding default booking portals into Supabase...');
  const { error: portError } = await supabase
    .from('portals')
    .upsert(DEFAULT_PORTALS, { onConflict: 'id' });

  if (portError) {
    console.error('❌ Error seeding portals:', portError.message);
    process.exit(1);
  }
  console.log(`✓ Seeded ${DEFAULT_PORTALS.length} booking portals.`);
  console.log('\n✅ Supabase seed completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Unexpected seed error:', err);
  process.exit(1);
});
